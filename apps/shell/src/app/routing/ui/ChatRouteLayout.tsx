import type { ReactNode } from "react";
import { ChatSidebar } from "../remotes/chatRemotes";

export function ChatRouteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 w-full h-[calc(100vh-110px)] gap-2 flex-row">
      <ChatSidebar />
      {children}
    </div>
  );
}
