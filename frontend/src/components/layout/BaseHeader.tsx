import { useState, useEffect, useRef } from "react";
import { ChevronDown, Bell, User, Lock, LogOut, Building } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import { Badge } from "@/components/ui/badge";

interface BaseHeaderProps {
  title?: string;
  userType?: string;
  profilePath?: string;
  changePasswordPath?: string;
  noticesPath?: string;
  customDropdowns?: React.ReactNode;
}

const BaseHeader = ({ 
  title = "ITM University, Gwalior", 
  userType = "user", 
  profilePath = "/profile", 
  changePasswordPath = "/change-password", 
  noticesPath = "/notices",
  customDropdowns
}: BaseHeaderProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<{name: string, department: string}>({
    name: "",
    department: ""
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user information from auth service
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUserInfo({
        name: currentUser.name || "",
        department: currentUser.department || "Not specified"
      });
    }
  }, []);

  const toggleDropdown = (dropdownName: string) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdownName);
    }
  };

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
    navigate('/');
  };

  // Handle clicks outside of dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }

    // Add event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-[#8B0000] text-white shadow-sm p-4 flex justify-between items-center relative">
      <div className="flex items-center gap-3">
        <img 
          src="/images/logo/Itm university white logo transparent.png" 
          alt="ITM University Logo" 
          className="h-8 w-auto object-contain"
        />
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div className="flex items-center gap-4" ref={dropdownRef}>
        {/* Department badge */}
        <div className="hidden md:flex items-center gap-2">
          <Building size={18} />
          <Badge variant="outline" className="bg-white/20 text-white border-white/10">
            {userInfo.department}
          </Badge>
        </div>
        
        {/* Custom dropdowns passed as props */}
        {customDropdowns}
        
        {/* Notifications dropdown - always present */}
        <div className="relative">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => toggleDropdown('notifications')}
          >
            <Bell width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <ChevronDown width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </div>
          {openDropdown === 'notifications' && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white shadow-md rounded-sm border z-50 text-gray-800">
              <div className="p-4 flex justify-center">
                <Link to={noticesPath} className="text-[#8B0000] hover:underline flex items-center">
                  See All Notices &gt;
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Profile dropdown - always present */}
        <div className="relative">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => toggleDropdown('profile')}
          >
            <span className="hidden md:inline-block mr-2">{userInfo.name}</span>
            <User width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <ChevronDown width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </div>
          {openDropdown === 'profile' && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white shadow-md rounded-sm border z-50 text-gray-800">
              <div className="p-3 border-b">
                <p className="font-medium text-sm">{userInfo.name}</p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Building size={12} className="mr-1" />
                  <span>{userInfo.department}</span>
                </div>
              </div>
              <div className="py-2">
                <Link to={profilePath} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <User size={18} />
                  <span>{userType} Profile</span>
                </Link>
                <Link to={changePasswordPath} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Lock size={18} />
                  <span>Change Password</span>
                </Link>
                <div className="border-t my-1"></div>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 w-full text-left">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default BaseHeader; 