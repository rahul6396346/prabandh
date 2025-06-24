import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [empType, setEmpType] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if user is already logged in
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
      await login(email, password, empType);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });
      
      // Redirect to the appropriate dashboard using userType from context
      navigate(`/${empType}/dashboard`);
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

  // Define employee types and their corresponding labels
  const employeeTypes = [
    { 
      id: 'academic',
      label: 'Academic',
      types: [
        { value: 'student', label: 'Student' },
        { value: 'faculty', label: 'Faculty' },
        { value: 'hod', label: 'HOD' }
      ]
    },
    {
      id: 'administration',
      label: 'Administration',
      types: [
        { value: 'dean', label: 'Dean' },
        { value: 'exam', label: 'Exam Cell' },
        { value: 'account', label: 'Accounts' }
      ]
    },
    {
      id: 'support',
      label: 'Support',
      types: [
        { value: 'deputy_registrar', label: 'Deputy Registrar' },
        { value: 'hostel', label: 'Hostel' },
        { value: 'sports', label: 'Sports' },
        { value: 'library', label: 'Library' }
      ]
    },
    {
      id: 'other',
      label: 'Other',
      types: [
        { value: 'hr', label: 'HR' },
        { value: 'counselling', label: 'Counselling' },
        { value: 'vc_office', label: 'VC Office' },
        { value: 'vc', label: 'VC' },
        { value: 'technician', label: 'Technician' },
        { value: 'naac', label: 'NAAC' },
        { value: 'tap', label: 'TAP' },
        { value: 'pro_vc', label: 'PRO VC' },
        { value: 'audit', label: 'Audit Team' },
        { value: 'assistant_registrar', label: 'Assistant Registrar' }
      ]
    },
    {
      id: 'admin',
      label: 'Admin',
      types: [
        { value: 'admin', label: 'Admin' }
      ]
    }
  ];

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
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Employee Type</Label>
                <div className="w-48">
                  <Select value={empType} onValueChange={setEmpType}>
                    <SelectTrigger className="university-select h-8">
                      <SelectValue placeholder="Select Employee Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {employeeTypes.map((group) => (
                        <SelectGroup key={group.id}>
                          <SelectLabel className="font-bold text-university-primary text-sm bg-university-primary/10 py-2 px-2 mb-1 rounded">
                            {group.label}
                          </SelectLabel>
                          {group.types.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto pr-2 space-y-4">
                {employeeTypes.map((group) => (
                  <div key={group.id} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-500">{group.label}</h4>
                    <RadioGroup
                      value={empType}
                      onValueChange={setEmpType}
                      className="grid grid-cols-2 gap-2"
                    >
                      {group.types.map((type) => (
                        <div key={type.value} className="flex items-center space-x-2">
                          <RadioGroupItem value={type.value} id={type.value} />
                          <Label htmlFor={type.value} className="text-sm cursor-pointer">
                            {type.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
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
