import { supabase } from "@/lib/supabase";

export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

// Helper function to get the session ID from localStorage
const getSessionId = (): string | null => {
  return localStorage.getItem("session_id");
};

// Helper function to format timestamps
const timeAgo = (date: string): string => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ✅ Standalone function to fetch conversations for the current session
export const getConversations = async (): Promise<Conversation[]> => {
  const sessionId = getSessionId(); // Retrieve the session ID

  if (!sessionId) {
    console.error("No session ID found. Unable to fetch conversations.");
    return [];
  }

  const { data, error } = await supabase
    .from("chats")
    .select("id, title, created_at, id")
    //.eq("session_id", sessionId) // Ensure messages belong to the same session
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return data.map((conv) => ({
    id: String(conv.id),
    title: conv.title || "Untitled",
    timestamp: timeAgo(conv.created_at),
  }));
};

export interface Message {
  id: string;
  content: string;
  type: "user" | "ai";
  created_at: string;
}
// Get messages for a specific chat session
export const getMessagesForChat = async (
  chatId: string,
): Promise<Message[]> => {
  if (!chatId) return [];

  const { data, error } = await supabase
    .from("messages")
    .select("id, message, created_at")
    .eq("chat_id", chatId) // Filter messages by chat session
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data.map((msg) => ({
    id: msg.id,
    ...msg.message, // Parse stored JSON data
    created_at: msg.created_at,
  }));
};
// 🔥 Set up a real-time listener for new chats
export const subscribeToNewMessages = (
  chatId: string,
  setMessages: (messages: Message[]) => void,
) => {
  // Create a subscription for new messages related to the specific chatId
  const messageSubscription = supabase
    .channel("messages-listener")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `chat_id=eq.${chatId}`,
      },
      async () => {
        console.log("New message detected, triggering re-fetch...");

        // Re-fetch messages for the current chat and update the state
        const updatedMessages = await getMessagesForChat(chatId);
        //setMessages(updatedMessages);
      },
    )
    .subscribe();

  // Return a cleanup function to unsubscribe from the channel when the component is unmounted or the chatId changes
  return () => {
    supabase.removeChannel(messageSubscription);
  };
};
