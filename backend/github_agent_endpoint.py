import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional

import httpx
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel
from pydantic_ai.messages import ModelRequest, ModelResponse, TextPart, UserPromptPart
from supabase import Client, create_client

# Add parent directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from github_agent import GitHubDeps, github_agent

# Get the path to the .env file one directory up
env_path = Path(__file__).resolve().parent.parent / ".env"

# Load the .env file
load_dotenv(dotenv_path=env_path)

# Initialize FastAPI app
app = FastAPI()
security = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase setup
supabase: Client = create_client(
    os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY")
)


# Request/Response Models
class AgentRequest(BaseModel):
    query: str
    # user_id: str
    chat_id: str
    request_id: str
    session_id: str


class AgentResponse(BaseModel):
    success: bool


def verify_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> bool:
    """Verify the bearer token against environment variable."""
    expected_token = os.getenv("API_BEARER_TOKEN")
    if not expected_token:
        raise HTTPException(
            status_code=500, detail="API_BEARER_TOKEN environment variable not set"
        )
    if credentials.credentials != expected_token:
        raise HTTPException(status_code=401, detail="Invalid authentication token")
    return True


async def fetch_conversation_history(
    session_id: str, chat_id: str, limit: int = 10
) -> List[Dict[str, Any]]:
    """Fetch the most recent conversation history for a session."""
    try:
        response = (
            supabase.table("messages")
            .select("*")
            .eq("session_id", session_id)
            .eq("chat_id", chat_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )

        # Convert to list and reverse to get chronological order
        messages = response.data[::-1]
        return messages
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch conversation history: {str(e)}"
        )


async def store_message(
    session_id: str,
    message_type: str,
    content: str,
    chat_id: str,
    data: Optional[Dict] = None,
):
    """Store a message in the Supabase messages table."""
    message_obj = {"type": message_type, "content": content}
    if data:
        message_obj["data"] = data

    try:
        supabase.table("messages").insert(
            {"chat_id": chat_id, "session_id": session_id, "message": message_obj}
        ).execute()
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to store message: {str(e)}"
        )


@app.post("/api/pydantic-github-agent", response_model=AgentResponse)
async def github_agent_endpoint(
    request: AgentRequest,  # ,
    # authenticated: bool = Depends(verify_token)
):
    try:
        # Fetch conversation history
        conversation_history = await fetch_conversation_history(
            request.session_id, request.chat_id
        )

        # Convert conversation history to format expected by agent
        messages = []
        for msg in conversation_history:
            print(msg)
            msg_data = msg["message"]
            msg_type = msg_data["type"]
            msg_content = msg_data["content"]
            msg = (
                ModelRequest(parts=[UserPromptPart(content=msg_content)])
                if msg_type == "user"
                else ModelResponse(parts=[TextPart(content=msg_content)])
            )
            messages.append(msg)
        print(messages)
        # Store user's query
        await store_message(
            session_id=request.session_id,
            message_type="user",
            content=request.query,
            chat_id=request.chat_id,
        )

        # Initialize agent dependencies
        async with httpx.AsyncClient() as client:
            deps = GitHubDeps(client=client, github_token=os.getenv("GITHUB_TOKEN"))

            # Run the agent with conversation history
            result = await github_agent.run(
                request.query, message_history=messages, deps=deps
            )

        # Store agent's response
        await store_message(
            session_id=request.session_id,
            message_type="ai",
            chat_id=request.chat_id,
            content=result.data,
            data={"request_id": request.request_id},
        )

        return AgentResponse(success=True)

    except Exception as e:
        print(f"Error processing agent request: {str(e)}")
        # Store error message in conversation
        await store_message(
            session_id=request.session_id,
            message_type="ai",
            chat_id=request.chat_id,
            content="I apologize, but I encountered an error processing your request.",
            data={"error": str(e), "request_id": request.request_id},
        )
        return AgentResponse(success=False)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
