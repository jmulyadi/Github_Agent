import { ChatInterface } from "@/components/ChatInterface";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useState } from "react";

const Index = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  return (
    <div className="min-h-screen bg-background">
      <ChatSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        setActiveChatId={setActiveChatId}
        activeChatId={activeChatId}
      />
      <ChatInterface isCollapsed={isCollapsed} activeChatId={activeChatId} />
    </div>
  );
};

export default Index;
