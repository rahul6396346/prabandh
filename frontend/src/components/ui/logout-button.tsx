import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonProps } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import authService from '@/services/authService';

interface LogoutButtonProps extends ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showIcon?: boolean;
}

export function LogoutButton({ 
  children = 'Logout', 
  variant = 'ghost', 
  showIcon = true,
  ...props 
}: LogoutButtonProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Error',
        description: 'There was a problem logging you out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button
      variant={variant}
      onClick={handleLogout}
      className="flex items-center gap-2"
      {...props}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      {children}
    </Button>
  );
}
