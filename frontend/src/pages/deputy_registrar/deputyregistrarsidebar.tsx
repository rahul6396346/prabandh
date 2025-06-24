import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import authService from "@/services/authService";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  FileText,
  FileArchive,
  FileSearch,
  FileSignature,
  FileUp,
  FileDown,
  FileCheck,
  FilePlus,
  User,
  Settings,
  LogOut,
  Lock,
  Building
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

interface NavItem {
  name: string;
  icon: JSX.Element;
  path: string;
  hasDropdown?: boolean;
  isSeparator?: boolean;
  dropdownItems?: { name: string; path: string }[];
}

const DeputyRegistrarSidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navItems: NavItem[] = [
    { name: "DASHBOARD", icon: <LayoutDashboard size={20} />, path: "/deputy_registrar/dashboard" },
    { 
      name: "ORGANIZATION", 
      icon: <Building size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Add school", path: "/deputy_registrar/schools" },
        { name: "Add program", path: "/deputy_registrar/programmes" },
        { name: "Add subject", path: "/deputy_registrar/subjects" },
        { name: "Subject With Schemes", path: "/deputy_registrar/scheme/subjects" },
      ]
    },
    { 
      name: "DOCUMENT MANAGEMENT", 
      icon: <FileText size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "All Documents", path: "/deputy_registrar/documents" },
        { name: "Upload Document", path: "/deputy_registrar/documents/upload" },
        { name: "Document Categories", path: "/deputy_registrar/documents/categories" },
        { name: "Document Templates", path: "/deputy_registrar/documents/templates" }
      ]
    },
    { 
      name: "RECORDS ARCHIVE", 
      icon: <FileArchive size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Archived Files", path: "/deputy_registrar/archive" },
        { name: "Archive History", path: "/deputy_registrar/archive/history" },
        { name: "Restore Files", path: "/deputy_registrar/archive/restore" }
      ]
    },
    { 
      name: "DOCUMENT SEARCH", 
      icon: <FileSearch size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Advanced Search", path: "/deputy_registrar/search" },
        { name: "Search History", path: "/deputy_registrar/search/history" },
        { name: "Saved Searches", path: "/deputy_registrar/search/saved" }
      ]
    },
    { 
      name: "APPROVALS", 
      icon: <FileSignature size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Pending Approvals", path: "/deputy_registrar/approvals/pending" },
        { name: "Approval History", path: "/deputy_registrar/approvals/history" },
        { name: "Approval Settings", path: "/deputy_registrar/approvals/settings" }
      ]
    },
    { 
      name: "DOCUMENT TRACKING", 
      icon: <FileCheck size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Track Document", path: "/deputy_registrar/tracking" },
        { name: "Tracking History", path: "/deputy_registrar/tracking/history" },
        { name: "Tracking Reports", path: "/deputy_registrar/tracking/reports" }
      ]
    },
    { 
      name: "REPORTS", 
      icon: <FileText size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Document Reports", path: "/deputy_registrar/reports/documents" },
        { name: "Activity Reports", path: "/deputy_registrar/reports/activity" },
        { name: "System Reports", path: "/deputy_registrar/reports/system" }
      ]
    },
    { 
      name: "SETTINGS", 
      icon: <Settings size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Profile Settings", path: "/deputy_registrar/settings/profile" },
        { name: "System Settings", path: "/deputy_registrar/settings/system" },
        { name: "Notification Settings", path: "/deputy_registrar/settings/notifications" }
      ]
    },
    { name: "PROFILE", icon: <User size={20} />, path: "/deputy_registrar/profile" },
    { name: "PASSWORD", icon: <Lock size={20} />, path: "/deputy_registrar/change-password" },
    // Add separator and logout at the end
    { name: "Logout", icon: <LogOut size={20} />, path: "/", isSeparator: true }
  ];

  return (
    <div className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      {/* Logo and Toggle Button */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!isCollapsed && (
          <Link to="/deputy_registrar/dashboard" className="flex items-center space-x-2">
            <Building className="h-6 w-6 text-[#8B0000]" />
            <span className="font-semibold text-lg">Deputy Registrar</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item, index) => (
            <li key={index}>
              {item.isSeparator && (
                <div className="my-2 border-t border-gray-200" />
              )}
              {item.hasDropdown ? (
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className={`w-full justify-start ${isCollapsed ? 'px-2' : 'px-4'} ${
                      location.pathname.startsWith(item.path) ? 'bg-[#8B0000]/10 text-[#8B0000]' : ''
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </Button>
                  {!isCollapsed && item.dropdownItems && (
                    <div className="pl-4 space-y-1">
                      {item.dropdownItems.map((dropdownItem, idx) => (
                        <Link
                          key={idx}
                          to={dropdownItem.path}
                          className={`block px-4 py-2 text-sm rounded-md ${
                            location.pathname === dropdownItem.path
                              ? 'bg-[#8B0000]/10 text-[#8B0000]'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-2 text-sm rounded-md ${
                    location.pathname === item.path
                      ? 'bg-[#8B0000]/10 text-[#8B0000]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-[#8B0000] flex items-center justify-center text-white">
              {authService.getCurrentUser()?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-sm font-medium">{authService.getCurrentUser()?.name || 'User'}</p>
              <p className="text-xs text-gray-500">Deputy Registrar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeputyRegistrarSidebar; 