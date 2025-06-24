import { useState } from "react";
import FacultySidebar from "./facultysidebar";
import FacultyHeader from "./facultyheader";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const FacultyLayout = ({ children, title }: LayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex">
      <FacultySidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className="flex-1 overflow-auto flex flex-col">
        <FacultyHeader title={title} />
        <main className="flex-1">
          {children}
        </main>
        <footer className="p-4 border-t text-center text-sm text-muted-foreground">
          © 2025 All rights reserved by ITM University, Gwalior | Designed & Developed by Software Development Team
        </footer>
      </div>
    </div>
  );
};

export default FacultyLayout; 