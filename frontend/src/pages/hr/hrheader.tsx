import { useState, useEffect, useRef } from "react";
import { ChevronDown, Bell, User, Lock, LogOut, Users, FileText, Briefcase } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  title?: string;
}

const HRHeader = ({ title = "ITM University, Gwalior" }: HeaderProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const toggleDropdown = (dropdownName: string) => {
    if (openDropdown === dropdownName) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(dropdownName);
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
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
      <div className="flex items-center gap-10" ref={dropdownRef}>
        <div className="relative">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => toggleDropdown('employees')}
          >
            <Users width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <ChevronDown width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </div>
          {openDropdown === 'employees' && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white shadow-md rounded-sm border z-50 text-gray-800">
              <div className="py-2">
                <Link to="/hr/employees/directory" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Users size={18} />
                  <span>Employee Directory</span>
                </Link>
                <Link to="/hr/employees/onboarding" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Users size={18} />
                  <span>Onboarding</span>
                </Link>
                <Link to="/hr/employees/performance" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Users size={18} />
                  <span>Performance Management</span>
                </Link>
                <Link to="/hr/employees/exit" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Users size={18} />
                  <span>Exit Management</span>
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => toggleDropdown('recruitment')}
          >
            <Briefcase width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <ChevronDown width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </div>
          {openDropdown === 'recruitment' && (
            <div className="absolute right-0 top-full mt-3 w-80 bg-white shadow-md rounded-sm border z-50 text-gray-800">
              <div className="py-2">
                <Link to="/hr/recruitment/jobs" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Briefcase size={18} />
                  <span>Job Postings</span>
                </Link>
                <Link to="/hr/recruitment/applications" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <FileText size={18} />
                  <span>Applications</span>
                </Link>
                <Link to="/hr/recruitment/interviews" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Users size={18} />
                  <span>Interviews</span>
                </Link>
                <Link to="/hr/recruitment/offers" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <Briefcase size={18} />
                  <span>Offers</span>
                </Link>
              </div>
            </div>
          )}
        </div>
        
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
                <Link to="/hr/notices" className="text-[#8B0000] hover:underline flex items-center">
                  See All Notices &gt;
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <div className="relative">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => toggleDropdown('profile')}
          >
            <User width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <ChevronDown width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </div>
          {openDropdown === 'profile' && (
            <div className="absolute right-0 top-full mt-3 w-64 bg-white shadow-md rounded-sm border z-50 text-gray-800">
              <div className="py-2">
                <Link to="/hr/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
                  <User size={18} />
                  <span>HR Profile</span>
                </Link>
                <Link to="/hr/change-password" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50">
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

export default HRHeader;