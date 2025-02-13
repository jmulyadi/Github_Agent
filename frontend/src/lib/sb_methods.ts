import { supabase } from "@/lib/supabase";

export interface Conversation {
  id: string;
  title: string;
  timestamp: string;
}

// Helper function to format timestamps
const timeAgo = (date: string): string => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase
    .from("messages")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return data.map((conv) => ({
    id: String(conv.id), // Convert to string if it's a number
    title: conv.title,
    timestamp: timeAgo(conv.created_at),
  }));
};
