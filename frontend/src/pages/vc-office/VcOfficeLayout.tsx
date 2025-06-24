import React, { useState } from "react";
import VcOfficeSidebar from "./VcOfficeSidebar";
import { User, Lock, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/services/authService";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';

const VcOfficeLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const { logout } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen">
      <VcOfficeSidebar />
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Top Navigation Bar */}
        <div className="flex items-center justify-between bg-[#8B0000] text-white px-6 py-3 shadow-md relative">
          <div className="font-bold text-lg flex items-center gap-2">
            <span>ITM University, Gwalior</span>
          </div>
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2 text-white hover:bg-[#AA0000] focus:outline-none"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline">{user?.name || "User"}</span>
            </Button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded shadow-lg z-50">
                <Link
                  to="/vcoffice/profile"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 border-b"
                  onClick={() => setMenuOpen(false)}
                >
                  <User className="h-4 w-4 mr-2" /> Profile
                </Link>
                <Link
                  to="/vcoffice/change-password"
                  className="flex items-center px-4 py-2 hover:bg-gray-100 border-b"
                  onClick={() => setMenuOpen(false)}
                >
                  <Lock className="h-4 w-4 mr-2" /> Change Password
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 hover:bg-gray-100 text-left"
                >
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-[#f9fafb]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default VcOfficeLayout; 