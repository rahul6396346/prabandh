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
  Building,
  PanelRight,
  SchoolIcon,
  Building2,
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
  dropdownItems?: { name: string; path: string }[];
  isSeparator?: boolean;
}

const navItems: NavItem[] = [
  { name: "DASHBOARD", icon: <LayoutDashboard size={20} />, path: "/deputy_registrar/dashboard" },
  { 
    name: "ORGANIZATION", 
    icon: <Building size={20} />, 
    path: "#", 
    hasDropdown: true,
    dropdownItems: [
      { name: "School Registration", path: "/deputy_registrar/schools" },
      { name: "Department Registration", path: "/deputy_registrar/departments" },
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
  { name: "Logout", icon: <LogOut size={20} />, path: "/", isSeparator: true }
];

const DeputyRegistrarSidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<number[]>([]);
  const [animatingDropdowns, setAnimatingDropdowns] = useState<number[]>([]);
  const [selectedSubmenuPaths, setSelectedSubmenuPaths] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState({
    name: "",
    department: "",
    id: ""
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserInfo({
        name: currentUser.name || "",
        department: currentUser.department || "Not specified",
        id: currentUser.registration_no || ""
      });
    }
  }, []);

  useEffect(() => {
    const newOpenDropdowns: number[] = [];
    navItems.forEach((item, index) => {
      if (item.dropdownItems?.some(subItem => 
        location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/'))
      ) {
        newOpenDropdowns.push(index);
        const matchingSubItem = item.dropdownItems.find(subItem => 
          location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/'));
        if (matchingSubItem && !selectedSubmenuPaths.includes(matchingSubItem.path)) {
          setSelectedSubmenuPaths(prev => [...prev, matchingSubItem.path]);
        }
      }
    });
    if (newOpenDropdowns.length > 0) {
      setOpenDropdowns(prev => {
        const combined = [...prev];
        newOpenDropdowns.forEach(index => {
          if (!combined.includes(index)) {
            combined.push(index);
          }
        });
        return combined;
      });
    }
  }, [location.pathname, selectedSubmenuPaths]);

  useEffect(() => {
    if (isCollapsed) {
      setOpenDropdowns([]);
      setAnimatingDropdowns([]);
    }
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (index: number) => {
    const containsSelectedPath = navItems[index].dropdownItems?.some(
      subItem => selectedSubmenuPaths.some(selectedPath => selectedPath.startsWith(subItem.path))
    );
    if (!openDropdowns.includes(index)) {
      setAnimatingDropdowns(prev => [...prev, index]);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOpenDropdowns(prev => [...prev, index]);
        });
      });
    } else if (!containsSelectedPath) {
      setOpenDropdowns(prev => prev.filter(i => i !== index));
      setTimeout(() => {
        setAnimatingDropdowns(prev => prev.filter(i => i !== index));
      }, 600);
    } else {
      setOpenDropdowns(prev => prev.filter(i => i !== index));
      setAnimatingDropdowns(prev => prev.filter(i => i !== index));
    }
  };

  return (
    <div
      className={`bg-sidebar border-r h-screen sticky top-0 ${isCollapsed ? "w-20" : "w-64"} overflow-y-auto flex flex-col`}
      style={{ transition: "width 500ms ease-in-out" }}
    >
      {/* Header */}
      <div className={`${isCollapsed ? "p-4" : "p-5"} border-b border-sidebar-border border-opacity-100 flex justify-between items-center transition-all duration-500 ease-in-out will-change-[padding]`}>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out flex justify-center">
            <span className="font-bold text-xl text-[#8B0000] transition-transform duration-500 ease-in-out">Deputy Registrar</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-full flex justify-center transition-all duration-500 ease-in-out">
            <span className="font-bold text-xl text-[#8B0000] transition-transform duration-500 ease-in-out">DR</span>
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
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
              (item.dropdownItems?.some(subItem => location.pathname === subItem.path) ?? false);
            const isDropdownOpen = openDropdowns.includes(index);
            const dropdownHeight = item.dropdownItems ? (item.dropdownItems.length * 36) + 8 : 0;
            return (
              <div key={index} className="relative" style={{ 
                marginBottom: !isCollapsed && isDropdownOpen ? `${dropdownHeight}px` : '8px'
              }}>
                {!item.hasDropdown ? (
                  <Link 
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer w-full overflow-hidden ${
                      isActive 
                        ? "bg-[#8B0000] text-white hover:bg-[#8B0000]" 
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${
                      item.isSeparator ? "mt-4 border-t border-sidebar-border border-opacity-100 pt-4" : ""
                    } ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                    style={{ transition: "background-color 300ms ease-in-out, color 300ms ease-in-out" }}
                  >
                    <div className={`${isCollapsed ? "w-6 h-6 flex items-center justify-center" : ""}`}>
                      {item.icon}
                    </div>
                    {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                  </Link>
                ) : (
                  <div
                    onClick={() => toggleDropdown(index)}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer overflow-hidden ${
                      isActive 
                        ? "bg-[#8B0000] text-white hover:bg-[#8B0000]" 
                        : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    } ${
                      item.isSeparator ? "mt-4 border-t border-sidebar-border border-opacity-100 pt-4" : ""
                    } ${
                      isCollapsed ? "justify-center" : ""
                    }`}
                    style={{ transition: "background-color 300ms ease-in-out, color 300ms ease-in-out" }}
                  >
                    <div className={`${isCollapsed ? "w-6 h-6 flex items-center justify-center" : ""}`}>
                      {item.icon}
                    </div>
                    {!isCollapsed && (
                      <>
                        <span className="whitespace-nowrap">{item.name}</span>
                        <ChevronRight 
                          className={`ml-auto h-4 w-4 ${isDropdownOpen ? 'rotate-90' : ''}`}
                          style={{ 
                            transition: "transform 300ms ease-in-out",
                            stroke: "currentColor",
                            strokeWidth: "2.5",
                            opacity: "0.9"
                          }}
                        />
                      </>
                    )}
                  </div>
                )}
                {/* Dropdown items with improved animation */}
                {!isCollapsed && item.hasDropdown && item.dropdownItems && (
                  <div 
                    className={`absolute left-0 w-full pointer-events-none`}
                    style={{ 
                      opacity: isDropdownOpen || animatingDropdowns.includes(index) ? 1 : 0,
                      visibility: (isDropdownOpen || animatingDropdowns.includes(index)) && !isCollapsed ? 'visible' : 'hidden',
                      top: '100%',
                      transition: 'opacity 300ms ease-in-out',
                      height: dropdownHeight,
                      marginTop: '2px'
                    }}
                  >
                    <div className="ml-9 space-y-1">
                      {item.dropdownItems.map((subItem, subIndex) => {
                        const isSubItemActive = location.pathname === subItem.path;
                        const isShowing = isDropdownOpen || animatingDropdowns.includes(index);
                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={`block px-3 py-1.5 text-sm rounded-md pointer-events-auto ${
                              isSubItemActive 
                                ? "bg-[#8B0000] bg-opacity-10 text-[#8B0000] font-medium" 
                                : "text-[#8B0000] hover:bg-sidebar-accent"
                            } mb-1`}
                            style={{
                              opacity: isDropdownOpen ? 1 : 0,
                              transform: isShowing ? 'translateY(0)' : 'translateY(-10px)',
                              transitionProperty: isDropdownOpen && !selectedSubmenuPaths.includes(subItem.path) ? 'opacity, transform' : 'none',
                              transitionDuration: isDropdownOpen && !selectedSubmenuPaths.includes(subItem.path) ? '300ms' : '0ms',
                              transitionTimingFunction: 'ease-in-out',
                              transitionDelay: isDropdownOpen && !selectedSubmenuPaths.includes(subItem.path) ? `${50 + subIndex * 60}ms` : '0ms',
                              whiteSpace: 'normal',
                              lineHeight: '1.2'
                            }}
                            onClick={() => {
                              setSelectedSubmenuPaths(prev => [...prev, subItem.path]);
                            }}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border border-opacity-100">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8B0000] bg-opacity-20 flex items-center justify-center text-[#8B0000] font-medium">
              DR
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">Deputy Registrar Portal</p>
              <p className="text-xs text-gray-500 truncate">ITM University, Gwalior</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-[#8B0000] bg-opacity-20 flex items-center justify-center text-[#8B0000] font-medium">
              DR
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeputyRegistrarSidebar; 