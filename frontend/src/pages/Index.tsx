
import { ChatInterface } from "@/components/ChatInterface";
import { ChatSidebar } from "@/components/ChatSidebar";
import { useState } from "react";

const Index = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <ChatSidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <ChatInterface isCollapsed={isCollapsed} />
    </div>
  );
};

export default Index;
