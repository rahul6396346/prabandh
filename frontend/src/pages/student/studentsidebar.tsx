import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Calendar,
  Clock,
  FileText,
  BookOpen,
  GraduationCap,
  User,
  FileQuestion,
  Bell,
  Briefcase,
  ClipboardList,
  Award,
  Settings,
  LogOut,
  Users,
  NotebookPen,
  Pencil,
  Library,
  BarChart3,
  MessagesSquare,
  CalendarCheck,
  Home,
  Fingerprint,
  CalendarX,
  Database,
  Lock,
  Key,
  FileCheck,
  FileCog,
  BadgeHelp,
  Bookmark,
  UserCog,
  Shield,
  FileSpreadsheet
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

const StudentSidebar = ({ isCollapsed, setIsCollapsed }: SidebarProps) => {
  const location = useLocation();
  const [openDropdowns, setOpenDropdowns] = useState<number[]>([]);
  const [animatingDropdowns, setAnimatingDropdowns] = useState<number[]>([]);
  const [selectedSubmenuPaths, setSelectedSubmenuPaths] = useState<string[]>([]);
  
  // Auto-open dropdowns based on current path
  useEffect(() => {
    const newOpenDropdowns: number[] = [];
    
    navItems.forEach((item, index) => {
      // Open dropdown if current path matches one of its items or is a sub-route
      if (item.dropdownItems?.some(subItem => 
        location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')
      )) {
        newOpenDropdowns.push(index);
        
        // Add the current path to selected submenu paths
        // Find the matching subItem path to ensure correct highlighting
        const matchingSubItem = item.dropdownItems.find(subItem => 
          location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')
        );
        if (matchingSubItem && !selectedSubmenuPaths.includes(matchingSubItem.path)) {
          setSelectedSubmenuPaths(prev => [...prev, matchingSubItem.path]);
        }
      }
    });
    
    if (newOpenDropdowns.length > 0) {
      setOpenDropdowns(prev => {
        // Merge previous open dropdowns with new ones (avoid duplicates)
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
  
  // Close all dropdowns when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      // Immediately clear all dropdowns without animation
      setOpenDropdowns([]);
      setAnimatingDropdowns([]);
    }
  }, [isCollapsed]);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleDropdown = (index: number) => {
    // Check if this dropdown contains the currently selected path or a parent of the selected path
    const containsSelectedPath = navItems[index].dropdownItems?.some(
      subItem => selectedSubmenuPaths.some(selectedPath => selectedPath.startsWith(subItem.path))
    );

    if (!openDropdowns.includes(index)) {
      // For opening: First add to animating list, then after a tiny delay add to open list
      setAnimatingDropdowns(prev => [...prev, index]);
      
      // Use requestAnimationFrame for smoother animation on opening
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setOpenDropdowns(prev => [...prev, index]);
        });
      });
    } else if (!containsSelectedPath) {
      // Only animate collapse if we're not on a selected submenu path
      // For closing: First remove from open list, keep in animating until animation completes
      setOpenDropdowns(prev => prev.filter(i => i !== index));
      
      // Remove from animating list after animation completes with longer timeout for smooth collapse
      setTimeout(() => {
        setAnimatingDropdowns(prev => prev.filter(i => i !== index));
      }, 600); // Slightly adjusted for better timing
    } else {
      // If we're on a selected path, just close without animation
      setOpenDropdowns(prev => prev.filter(i => i !== index));
      setAnimatingDropdowns(prev => prev.filter(i => i !== index));
    }
  };

  const navItems: NavItem[] = [
    { name: "DASHBOARD", icon: <LayoutDashboard size={20} />, path: "/student/dashboard" },
    { 
      name: "ACADEMIC", 
      icon: <BookOpen size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "My Courses", path: "/student/courses" },
        { name: "Class Schedule", path: "/student/class-schedule" },
        { name: "Course Materials", path: "/student/course-materials" },
        { name: "Academic Calendar", path: "/student/academic-calendar" }
      ]
    },
    { 
      name: "ATTENDANCE", 
      icon: <CalendarCheck size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Attendance Report", path: "/student/attendance-report" },
        { name: "Biometric Attendance", path: "/student/biometric-attendance" }
      ]
    },
    { 
      name: "EXAMS & RESULTS", 
      icon: <FileCheck size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Exam Schedule", path: "/student/exam-schedule" },
        { name: "Results", path: "/student/results" },
        { name: "Grade Card", path: "/student/grade-card" }
      ]
    },
    { 
      name: "ASSIGNMENTS", 
      icon: <ClipboardList size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "View Assignments", path: "/student/view-assignments" },
        { name: "Submit Assignment", path: "/student/submit-assignment" },
        { name: "Assignment Grades", path: "/student/assignment-grades" }
      ]
    },
    { 
      name: "FEES & PAYMENTS", 
      icon: <Database size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Fee Structure", path: "/student/fee-structure" },
        { name: "Payment History", path: "/student/payment-history" },
        { name: "Pay Fees", path: "/student/pay-fees" }
      ]
    },
    { 
      name: "LEAVE APPLICATION", 
      icon: <CalendarX size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Apply for Leave", path: "/student/leave/apply" },
        { name: "Leave Status", path: "/student/leave/status" },
        { name: "Leave History", path: "/student/leave/history" }
      ]
    },
    { 
      name: "LIBRARY", 
      icon: <Library size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Browse Books", path: "/student/library/browse" },
        { name: "My Borrowed Books", path: "/student/library/borrowed" },
        { name: "Library Dues", path: "/student/library/dues" }
      ]
    },
    { 
      name: "CAMPUS LIFE", 
      icon: <Users size={20} />, 
      path: "#", 
      hasDropdown: true,
      dropdownItems: [
        { name: "Events & Activities", path: "/student/campus/events" },
        { name: "Clubs & Societies", path: "/student/campus/clubs" },
        { name: "Sports", path: "/student/campus/sports" }
      ]
    },
    { name: "PROFILE", icon: <User size={20} />, path: "/student/profile" },
    { name: "PASSWORD", icon: <Lock size={20} />, path: "/student/change-password" },
    // Add separator and logout at the end
    { name: "Logout", icon: <LogOut size={20} />, path: "/", isSeparator: true }
  ];

  return (
    <div
      className={`bg-sidebar border-r h-screen sticky top-0 ${isCollapsed ? "w-20" : "w-64"} overflow-y-auto flex flex-col`}
      style={{ transition: "width 500ms ease-in-out" }}
    >
      {/* Header */}
      <div className={`${isCollapsed ? "p-4" : "p-5"} border-b border-sidebar-border border-opacity-100 flex justify-between items-center transition-all duration-500 ease-in-out will-change-[padding]`}>
        {!isCollapsed && (
          <div className="flex-1 overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out flex justify-center">
            <span className="font-bold text-xl text-[#8B0000] transition-transform duration-500 ease-in-out">Student Portal</span>
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
          className={`${isCollapsed ? "" : "absolute right-4"} transition-all duration-500 ease-in-out text-[#8B0000] hover:bg-[#8B0000]/10 hover:text-[#8B0000]`}
          onClick={toggleSidebar}
        >
          {isCollapsed ? <ChevronRight size={20} className="transition-transform duration-500 ease-in-out" /> : <ChevronLeft size={20} className="transition-transform duration-500 ease-in-out" />}
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-1" style={{
        overflowY: (!isCollapsed && openDropdowns.length > 0) ? "scroll" : "hidden",
        height: (!isCollapsed && openDropdowns.length > 0) ? "calc(-132px + 100vh)" : "auto"
      }}>
        <nav className="space-y-0 px-2">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path || 
              (item.dropdownItems?.some(subItem => location.pathname === subItem.path) ?? false);
            const isDropdownOpen = openDropdowns.includes(index);
            
            // Calculate dropdown height for precise animations
            const dropdownHeight = item.dropdownItems ? (item.dropdownItems.length * 36) + 8 : 0;

            // Special case spacing for specific items
            const hasSpecialSpacing = 
              item.name === "Exams" || 
              item.name === "Research";
            
            // Specifically reduce gap between certain items
            const reduceSpacingAfterItem = 
              (item.name === "Assignments" && index > 0) ||
              (item.name === "Exams" && index > 0);
            
            return (
              <div key={index} className="relative" style={{ 
                marginBottom: !isCollapsed && isDropdownOpen ? `${dropdownHeight}px` : 
                               (reduceSpacingAfterItem ? '4px' :
                               (hasSpecialSpacing ? '8px' : '8px'))
              }}>
                {!item.hasDropdown ? (
                  <Link 
                    to={item.path}
                    onClick={(e) => {
                      // Prevent default only if the link is not ready yet or is a placeholder
                      if (item.path.startsWith('#')) {
                        e.preventDefault();
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2 text-sm rounded-md cursor-pointer overflow-hidden ${
                      isActive 
                        ? "bg-[#8B0000] text-white hover:bg-[#8B0000]" 
                        : "hover:bg-sidebar-accent hover:text-[#8B0000]"
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
                        : "hover:bg-sidebar-accent hover:text-[#8B0000]"
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
                        {item.hasDropdown && (
                          <ChevronRight
                            className={`ml-auto h-4 w-4 transition-transform duration-300 text-[#8B0000] ${
                              isDropdownOpen ? 'rotate-90' : ''
                            }`}
                            style={{
                              transform: isDropdownOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                              opacity: "0.9"
                            }}
                          />
                        )}
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
                        const isLastItem = subIndex === item.dropdownItems!.length - 1;
                        
                        return (
                          <Link
                            key={subIndex}
                            to={subItem.path}
                            className={`block px-3 py-1.5 text-sm rounded-md pointer-events-auto ${
                              isSubItemActive 
                                ? "bg-[#8B0000] bg-opacity-10 text-[#8B0000] font-medium" 
                                : "text-[#8B0000] hover:bg-sidebar-accent"
                            } ${!isLastItem ? 'mb-1' : ''}`}
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
                              // Add this path to selected submenu paths when clicked
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
              ST
            </div>
            <div className="truncate">
              <p className="text-sm font-medium truncate">Student Portal</p>
              <p className="text-xs text-gray-500 truncate">ITM University, Gwalior</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-[#8B0000] bg-opacity-20 flex items-center justify-center text-[#8B0000] font-medium">
              ST
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentSidebar;
