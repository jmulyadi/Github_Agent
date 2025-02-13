import { MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { getConversations, Conversation } from "@/lib/sb_methods";
import { useEffect, useState } from "react";
//
//interface Conversation {
//  id: string;
//  title: string;
//  timestamp: string;
//}

interface ChatSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export const ChatSidebar = ({
  isCollapsed,
  setIsCollapsed,
}: ChatSidebarProps) => {
  // Placeholder conversations (will come from Supabase later)
  //const conversations: Conversation[] = [
  //  { id: "1", title: "React Router Analysis", timestamp: "2h ago" },
  //  { id: "2", title: "Next.js Repo Review", timestamp: "5h ago" },
  //  { id: "3", title: "Vite Configuration", timestamp: "1d ago" },
  //];

  // State to hold conversations fetched from Supabase
  const [conversations, setConversations] = useState<Conversation[]>([]);

  // Fetch conversations when the component mounts
  useEffect(() => {
    const fetchConversations = async () => {
      const convos = await getConversations();
      setConversations(convos);
    };

    fetchConversations();
  }, []); // Empty dependency array ensures this runs only once

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
          <MessageSquare
            className={`w-5 h-5 md:w-6 md:h-6 text-accent ${!isCollapsed && "mr-2"}`}
          />
          {!isCollapsed && (
            <span className="font-semibold text-base md:text-lg">Chats</span>
          )}
        </div>

        {!isCollapsed && (
          <div className="space-y-1.5 md:space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="p-2.5 md:p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group"
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
