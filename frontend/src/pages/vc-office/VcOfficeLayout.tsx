import React, { useState } from "react";
import VcOfficeSidebar from "./VcOfficeSidebar";
import VcOfficeHeader from "./VcOfficeHeader";
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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      <VcOfficeSidebar />
      <div className="flex-1 overflow-auto flex flex-col">
        <VcOfficeHeader />
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

export default VcOfficeLayout; 