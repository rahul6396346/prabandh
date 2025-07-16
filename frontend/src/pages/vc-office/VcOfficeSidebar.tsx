import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  FileText,
  Archive,
  BookOpen,
  Upload,
  Users,
  ClipboardList
} from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';

const menu = [
  {
    section: "DASHBOARD",
    items: [
      { name: "Dashboard", path: "/vc_office/dashboard", icon: "FileText" },
      { name: "Events", path: "/vc_office/events", icon: "Archive" },
    ]
  },
  {
    section: "DOCUMENT MANAGEMENT",
    items: [
      { name: "All Circulars", path: "/vc_office/circulars", icon: "BookOpen" },
      { name: "Upload Circular", path: "/vc_office/uploads", icon: "Upload" },
      { name: "Faculty Reviews", path: "/vc_office/faculty-reviews", icon: "Users" },
    ]
  },
  {
    section: "LEAVE PROCESSING",
    items: [
      { name: "Leave Processing", path: "/vc_office/leave-processing", icon: "ClipboardList" },
    ]
  },
];

const iconMap = {
  FileText,
  Archive,
  BookOpen,
  Upload,
  Users,
  ClipboardList,
};

const VcOfficeSidebar = () => {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { logout } = useAuth();
  const user = JSON.parse(localStorage.getItem("user") || '{}');

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    window.location.href = '/';
  };

  return (
    <div className={`bg-sidebar border-r h-screen sticky top-0 ${isCollapsed ? "w-20" : "w-64"} overflow-y-auto flex flex-col`} style={{ transition: "width 500ms ease-in-out" }}>
      {/* Header */}
      <div className={`${isCollapsed ? "p-4" : "p-5"} border-b border-sidebar-border border-opacity-100 flex justify-between items-center transition-all duration-500 ease-in-out will-change-[padding]`}>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out flex justify-center">
            <span className="font-bold text-xl text-[#8B0000] transition-transform duration-500 ease-in-out">ITM University</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center transition-all duration-500 ease-in-out">
            <span className="font-bold text-xl text-[#8B0000] transition-transform duration-500 ease-in-out">ITM</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={`${isCollapsed ? "" : "absolute right-4"} transition-all duration-500 ease-in-out`}
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight size={20} className="transition-transform duration-500 ease-in-out" /> : <ChevronLeft size={20} className="transition-transform duration-500 ease-in-out" />}
        </Button>
      </div>
      {/* Navigation */}
      <div className="flex-1 py-1">
        <nav className="space-y-0.5 px-2 pt-1">
          {menu.map((section, idx) => (
            <div key={section.section} className="mb-2">
              <div className="px-6 py-2 text-xs font-bold tracking-widest text-[#8B0000] uppercase bg-[#8B0000]/10 rounded">
                {section.section}
              </div>
              {section.items.map(item => {
                const Icon = iconMap[item.icon];
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer w-full overflow-hidden ${
                      isActive 
                        ? "bg-[#8B0000] text-white hover:bg-[#8B0000]" 
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                    style={{ transition: "background-color 300ms ease-in-out, color 300ms ease-in-out" }}
                  >
                    <div className={`${isCollapsed ? "w-6 h-6 flex items-center justify-center" : ""}`}>{Icon && <Icon size={20} />}</div>
                    {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border border-opacity-100">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8B0000] bg-opacity-20 flex items-center justify-center text-[#8B0000] font-medium">
              VC
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">VC Office Portal</p>
              <p className="text-xs text-gray-500 truncate">ITM University, Gwalior</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-[#8B0000] bg-opacity-20 flex items-center justify-center text-[#8B0000] font-medium">
              VC
            </div>
          </div>
        )}
        <button onClick={handleLogout} title="Logout" className="ml-2 text-[#8B0000] hover:text-red-300">
          <LogOut size={20} />
        </button>
      </div>
    </div>
  );
};

export default VcOfficeSidebar; 