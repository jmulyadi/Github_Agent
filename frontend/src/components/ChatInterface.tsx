import { getSessionId } from "@/lib/session_id";
import { useState, useEffect, act } from "react";
import { Send } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import clsx from "clsx"; // Import clsx for cleaner class handling
import { supabase } from "@/lib/supabase";

interface Message {
  type: "user" | "ai";
  content: string;
}

interface ChatInterfaceProps {
  isCollapsed: boolean;
  activeChatId: string | null;
}
const session_id = getSessionId();
export const ChatInterface = ({
  isCollapsed,
  activeChatId,
}: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const isMobile = useIsMobile();

  // Fetch messages when activeChatId changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatId) return;

      const { data, error } = await supabase
        .from("messages")
        .select("message")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: true }); // Assuming created_at exists

      if (error) {
        console.error("Error fetching messages:", error.message);
        return;
      }

      // Parse messages and include AI responses

      const parsedMessages = [];
      data.forEach((msg) => {
        const message = msg.message;
        parsedMessages.push(message);
      });
      setMessages(parsedMessages);
    };

    fetchMessages();
  }, [activeChatId, messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      type: "user",
      content: input,
    };
    // Check if activeChatId exists
    if (!activeChatId) {
      console.error("Error: No active chat ID available.");
      return;
    }
    // AI CALL HEREERE!!!
    try {
      await fetch("http://localhost:8001/api/pydantic-github-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: input,
          chat_id: activeChatId,
          request_id: crypto.randomUUID(),
          session_id: session_id,
        }),
      });
    } catch (error) {
      console.error("Error sending request:", error);
    }

    setInput(""); // Reset input field
    setMessages([...messages, newMessage]);
  };

  return (
    <div
      className={clsx(
        "min-h-screen transition-all duration-300",
        isCollapsed ? "pl-16" : "pl-64",
      )}
    >
      <div className="max-w-4xl mx-auto p-2 md:p-4 pt-4 md:pt-8">
        {messages.length === 0 ? (
          <div className="text-center py-10 md:py-20">
            <h1 className="text-2xl md:text-4xl font-bold mb-3 md:mb-4 text-accent">
              GitHub Repository Analyzer
            </h1>
            <p className="text-gray-400 text-sm md:text-base px-4">
              Paste a GitHub URL and ask questions about the repository.
            </p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6 mb-20 md:mb-24 px-2 md:px-4">
            {messages.map((message) => (
              <div
                key={message.request_id}
                className={`message-bubble ${
                  message.type === "user" ? "user-message" : "ai-message"
                } text-sm md:text-base`}
              >
                {message.content}
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className={clsx(
            "fixed bottom-0 right-0 p-2 md:p-4 bg-background/80 backdrop-blur-lg border-t border-white/10 transition-all duration-300",
            isCollapsed ? "left-16" : "left-64",
          )}
        >
          <div className="flex gap-2 md:gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isMobile
                  ? "Type a message..."
                  : "Enter a GitHub URL or ask a question..."
              }
              className="flex-1 bg-secondary/30 rounded-lg px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-accent/50 border border-white/10"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent/80 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span className="hidden md:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
