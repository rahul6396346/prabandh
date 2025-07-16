import { useState } from "react";
import DeanSidebar from "./deansidebar";
import DeanHeader from "./deanheader";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const DeanLayout = ({ children, title }: LayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex">
      <DeanSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <DeanHeader title={title} />
        <div className="flex-1 overflow-auto flex flex-col">
          <main className="flex-1">
            {children}
          </main>
          <footer className="p-4 border-t text-center text-sm text-muted-foreground">
            © 2025 All rights reserved by ITM University, Gwalior | Designed & Developed by Software Development Team
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DeanLayout; 