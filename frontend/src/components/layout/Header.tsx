import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-university-primary sticky top-0 z-50 shadow-md">
      <div className="university-container py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src="/images/logo/Itm university white logo transparent.png" 
              alt="ITM University Logo" 
              className="h-12"
            />
          </Link>

          {/* Login Button / User Menu */}
          <div className="flex items-center">
            <Link to="/login" className="hidden md:flex items-center space-x-1 bg-white/10 text-white rounded-md px-3 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
              <User size={16} className="mr-1" />
              Login
            </Link>
            
            {/* Mobile Menu Button */}
            <Button variant="ghost" className="md:hidden text-white" onClick={toggleMenu}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            <Link to="/login" className="flex items-center justify-center space-x-1 bg-white/10 text-white rounded-md px-3 py-2 text-base font-medium hover:bg-white/20 transition-colors" onClick={toggleMenu}>
              <User size={16} className="mr-1" />
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
