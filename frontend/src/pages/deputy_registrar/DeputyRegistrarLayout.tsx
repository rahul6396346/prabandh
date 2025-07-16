import React from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import DeputyRegistrarSidebar from "./Deputyregistrarsidebar";
import { User, Lock, LogOut } from "lucide-react";
import authService from "@/services/authService";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import DeputyRegistrarHeader from "./DeputyRegistrarHeader";

const DeputyRegistrarLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const { logout } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      <DeputyRegistrarSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <DeputyRegistrarHeader />
        <div className="flex-1 overflow-auto flex flex-col">
          <main className="flex-1">
            {children ? children : <Outlet />}
          </main>
          <footer className="p-4 border-t text-center text-sm text-muted-foreground">
            © 2025 All rights reserved by ITM University, Gwalior | Designed & Developed by Software Development Team
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DeputyRegistrarLayout; 