import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import authService from '@/services/authService';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, isAuthenticated, userType, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!authLoading && isAuthenticated && userType) {
      navigate(`/${userType}/dashboard`);
    }
  }, [navigate, isAuthenticated, userType, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password.",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const emptype = await login(email, password);
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      navigate(`/${emptype}/dashboard`);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: error.response?.data?.detail || "Invalid credentials. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-13rem)] bg-gray-50 px-4 py-12">
      <Link 
        to="/" 
        className="flex items-center text-university-primary hover:text-university-secondary mb-4 self-start ml-4 md:ml-[calc(50%-12rem)]"
      >
        <ArrowLeft className="mr-1" size={16} />
        <span>Back to Home</span>
      </Link>
      <Card className="w-full max-w-md shadow-lg border-0 animate-fade-in">
        <CardHeader className="space-y-1 bg-university-primary text-white rounded-t-lg">
          <CardTitle className="text-2xl font-display text-center">Welcome to Prabandh</CardTitle>
          <CardDescription className="text-white/80 text-center">
            ITM University's Management Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="university-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="university-input"
              />
            </div>
            <Button type="submit" className="w-full bg-university-primary hover:bg-university-secondary" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
            <div className="text-center space-y-2">
              <Link to="/forgot-password" className="text-sm text-university-primary hover:underline block">
                Forgot password?
              </Link>
              <div className="text-sm">
                <span className="text-gray-600">Don't have an account? </span>
                <Link to="/register" className="text-university-primary hover:underline font-medium">
                  Create Account
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
