import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import authService from '@/services/authService';

const Register = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    registration_no: '',
    name: '',
    father_name: '',
    gender: '',
    category: '',
    dob: '',
    designation: '',
    contact_no: '',
    primary_email: '',
    official_email: '',
    address: '',
    joining_date: '',
    qualification: '',
    experience: '',
    marital_status: '',
    department: '',
    emptype: '',
    school: null,
    password: '',
    confirmPassword: ''
  });

  const [isLoading, setIsLoading] = useState(false);

  // Define employee types configuration - same as Login.tsx
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
        { value: 'account', label: 'Accounts' },
        { value: 'vc_office', label: 'vc office' }
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
        { value: 'vc', label: 'VC' },
        { value: 'pro_vc', label: 'PRO VC' }
      ]
    }
  ];

  // Define university departments
  const universityDepartments = [
    { id: 'engineering', label: 'Engineering', departments: [
      { value: 'btech_cse', label: 'B.Tech (Computer Science)' },
      { value: 'btech_ece', label: 'B.Tech (Electronics & Communication)' },
      { value: 'btech_civil', label: 'B.Tech (Civil Engineering)' },
      { value: 'btech_mechanical', label: 'B.Tech (Mechanical Engineering)' },
      { value: 'btech_electrical', label: 'B.Tech (Electrical Engineering)' },
    ]},
    { id: 'management', label: 'Management', departments: [
      { value: 'mba_general', label: 'MBA (General)' },
      { value: 'mba_finance', label: 'MBA (Finance)' },
      { value: 'mba_marketing', label: 'MBA (Marketing)' },
      { value: 'mba_hr', label: 'MBA (Human Resources)' },
    ]},
    { id: 'computer_applications', label: 'Computer Applications', departments: [
      { value: 'mca', label: 'MCA' },
      { value: 'bca', label: 'BCA' },
    ]},
    { id: 'science', label: 'Science', departments: [
      { value: 'msc_physics', label: 'M.Sc. (Physics)' },
      { value: 'msc_chemistry', label: 'M.Sc. (Chemistry)' },
      { value: 'msc_mathematics', label: 'M.Sc. (Mathematics)' },
      { value: 'bsc', label: 'B.Sc.' },
    ]},
    { id: 'arts', label: 'Arts & Humanities', departments: [
      { value: 'ba_english', label: 'BA (English)' },
      { value: 'ba_history', label: 'BA (History)' },
      { value: 'ma_economics', label: 'MA (Economics)' },
    ]},
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.registration_no || !formData.name || !formData.primary_email || !formData.password || !formData.emptype) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including Employee Type.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Include department and other additional fields in registration data
      const registrationData = {
        registration_no: formData.registration_no,
        name: formData.name,
        primary_email: formData.primary_email,
        password: formData.password,
        emptype: formData.emptype,
        department: formData.department, // Include department
        designation: formData.designation,
        gender: formData.gender,
        father_name: formData.father_name,
        contact_no: formData.contact_no,
        address: formData.address,
        qualification: formData.qualification,
        experience: formData.experience,
        joining_date: formData.joining_date
      };
      
      // Attempt registration
      const response = await authService.register(registrationData);
      
      // Store selected department in localStorage for dashboard use
      localStorage.setItem('userDepartment', formData.department);
      
      // Log authentication state
      console.log('Registration successful:', {
        userType: formData.emptype,
        department: formData.department,
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        token: !!localStorage.getItem('token'),
        storedUserType: localStorage.getItem('userType')
      });
      
      toast({
        title: "Registration Successful",
        description: `Welcome ${response.user.name}!`,
      });
      
      // Redirect to the appropriate dashboard based on employee type
      navigate(`/${formData.emptype}/dashboard`);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle error response
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message ||
                          "Registration failed. Please try again.";
      
      toast({
        title: "Registration Failed",
        description: errorMessage,
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
          <CardTitle className="text-2xl font-display text-center">Faculty Registration</CardTitle>
          <CardDescription className="text-white/80 text-center">
            Create your faculty account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registration_no">Registration No. <span className="text-red-500">*</span></Label>
              <Input
                id="registration_no"
                name="registration_no"
                placeholder="Enter your registration number"
                value={formData.registration_no}
                onChange={handleChange}
                className="university-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="university-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name</Label>
              <Input
                id="father_name"
                name="father_name"
                placeholder="Enter your father's name"
                value={formData.father_name}
                onChange={handleChange}
                className="university-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select value={formData.gender} onValueChange={(value) => handleSelectChange('gender', value)}>
                  <SelectTrigger className="university-select">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleSelectChange('category', value)}>
                  <SelectTrigger className="university-select">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="SC">SC</SelectItem>
                    <SelectItem value="ST">ST</SelectItem>
                    <SelectItem value="OBC">OBC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  name="dob"
                  type="date"
                  value={formData.dob}
                  onChange={handleChange}
                  className="university-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marital_status">Marital Status</Label>
                <Select value={formData.marital_status} onValueChange={(value) => handleSelectChange('marital_status', value)}>
                  <SelectTrigger className="university-select">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primary_email">Primary Email <span className="text-red-500">*</span></Label>
              <Input
                id="primary_email"
                name="primary_email"
                type="email"
                placeholder="Enter your primary email"
                value={formData.primary_email}
                onChange={handleChange}
                className="university-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="official_email">Official Email</Label>
              <Input
                id="official_email"
                name="official_email"
                type="email"
                placeholder="Enter your official email"
                value={formData.official_email}
                onChange={handleChange}
                className="university-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_no">Contact Number</Label>
              <Input
                id="contact_no"
                name="contact_no"
                placeholder="Enter your contact number"
                value={formData.contact_no}
                onChange={handleChange}
                className="university-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleChange}
                className="university-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} onValueChange={(value) => handleSelectChange('department', value)}>
                  <SelectTrigger className="university-select">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {universityDepartments.map((group) => (
                      <SelectGroup key={group.id}>
                        <SelectLabel className="font-bold text-university-primary text-sm bg-university-primary/10 py-2 px-2 mb-1 rounded">
                          {group.label}
                        </SelectLabel>
                        {group.departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="designation">Designation</Label>
                <Input
                  id="designation"
                  name="designation"
                  placeholder="Enter your designation"
                  value={formData.designation}
                  onChange={handleChange}
                  className="university-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  name="qualification"
                  placeholder="Enter your qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  className="university-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  name="experience"
                  placeholder="Enter your experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="university-input"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input
                  id="joining_date"
                  name="joining_date"
                  type="date"
                  value={formData.joining_date}
                  onChange={handleChange}
                  className="university-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emptype">Employee Type <span className="text-red-500">*</span></Label>
                <Select value={formData.emptype} onValueChange={(value) => handleSelectChange('emptype', value)} required>
                  <SelectTrigger className="university-select">
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

            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                className="university-input"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="university-input"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-university-primary hover:bg-university-secondary mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className="text-center text-sm mt-4">
              <span className="text-gray-600">Already have an account? </span>
              <Link to="/login" className="text-university-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
