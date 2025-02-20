import {
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  SquarePen,
  Sword,
} from "lucide-react";
import {
  getConversations,
  Conversation,
  subscribeToNewMessages,
} from "@/lib/sb_methods";
import { useEffect, useState } from "react";

interface ChatSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  setActiveChatId: (activeChatId: string) => void;
  activeChatId: string | null;
}

export const ChatSidebar = ({
  isCollapsed,
  setIsCollapsed,
  setActiveChatId,
  activeChatId,
}: ChatSidebarProps) => {
  // State to hold conversations fetched from Supabase
  const [conversations, setConversations] = useState<Conversation[]>([]);
  // State to hold the currently selected chat's ID
  //const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Fetch conversations when the component mounts
  useEffect(() => {
    const fetchConversations = async () => {
      // Get all conversations
      const convos = await getConversations();
      setConversations(convos);

      // Set the active chat ID to the most recent chat (or first chat if empty)
      if (convos.length > 0) {
        setActiveChatId(convos[0].id); // Most recent chat (based on how data is ordered)
      }
    };

    fetchConversations();
  }, []); // Empty dependency array ensures this runs only once

  // Subscribe to new messages for the active chat
  useEffect(() => {
    console.log("gott do something here");
    // Cleanup the subscription when the component is unmounted or chatId changes
  }, [activeChatId]); // Re-run this effect whenever activeChatId changes

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } h-screen fixed left-0 top-0 bg-secondary/30 backdrop-blur-lg border-r border-white/10 transition-all duration-300 ease-in-out z-10`}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute right-[-20px] top-6 bg-accent rounded-full p-1.5 shadow-lg hover:bg-accent/80 transition-colors z-50 hidden md:block"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-white" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-white" />
        )}
      </button>

      <div className="p-3 md:p-4">
        <div
          className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-6 md:mb-8`}
        >
          <button
            //ADD NEW CHAT FUNCTION EHRE
            //onClick={}
            className="rounded-lg p-2 hover:bg-white/5 transition-colors"
          >
            <SquarePen
              className={`md:w-6 md:h-6 text-accent ${!isCollapsed && "mr-2"}`}
            />
          </button>
          {!isCollapsed && (
            <span className="font-semibold text-base md:text-lg">Chats</span>
          )}
        </div>

        {!isCollapsed && (
          <div className="space-y-1.5 md:space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id} // Use chat_id for unique identifier
                className="p-2.5 md:p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
                // When clicked, set the active chat's ID
                onClick={() => {
                  console.log("curr chat_id: ", conv.id, conv);
                  setActiveChatId(conv.id);
                }}
              >
                <div className="text-sm font-medium truncate">{conv.title}</div>
                <div className="text-xs text-gray-400">{conv.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
