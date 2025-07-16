import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import authService from '@/services/authService';
import { schoolService } from '@/services/schoolService';

const FacultyRegistration = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [schools, setSchools] = useState<{ id: number; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    school: '',
    password: '',
    confirmPassword: ''
  });

  // Fetch schools from backend
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await schoolService.getAllSchools();
        setSchools(response);
      } catch (error) {
        toast({ title: "Error", description: "Failed to fetch schools.", variant: "destructive" });
      }
    };
    fetchSchools();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.registration_no || !formData.name || !formData.primary_email || !formData.password || !formData.emptype || !formData.school) {
      toast({ title: "Missing Information", description: "Please fill in all required fields including School.", variant: "destructive" });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Password Mismatch", description: "Passwords do not match. Please try again.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const registrationData = {
        registration_no: formData.registration_no,
        name: formData.name,
        primary_email: formData.primary_email,
        password: formData.password,
        emptype: formData.emptype,
        department: formData.department,
        designation: formData.designation,
        gender: formData.gender,
        father_name: formData.father_name,
        contact_no: formData.contact_no,
        address: formData.address,
        qualification: formData.qualification,
        experience: formData.experience,
        joining_date: formData.joining_date,
        school: Number(formData.school)
      };
      await authService.register(registrationData);
      toast({ title: "Registration Successful", description: `Faculty member ${formData.name} registered!` });
      navigate('/hr/dashboard');
    } catch (error: any) {
      toast({ title: "Registration Failed", description: error.response?.data?.detail || "Registration failed. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Employee types and departments (reuse from Register)
  const employeeTypes = [
    { id: 'academic', label: 'Academic', types: [ { value: 'faculty', label: 'Faculty' }, { value: 'hod', label: 'HOD' } ] },
    { id: 'administration', label: 'Administration', types: [ { value: 'dean', label: 'Dean' }, { value: 'exam', label: 'Exam Cell' }, { value: 'account', label: 'Accounts' } ] },
    { id: 'support', label: 'Support', types: [ { value: 'deputy_registrar', label: 'Deputy Registrar' }, { value: 'hostel', label: 'Hostel' }, { value: 'sports', label: 'Sports' }, { value: 'library', label: 'Library' } ] },
    { id: 'other', label: 'Other', types: [ { value: 'hr', label: 'HR' }, { value: 'vc', label: 'VC' }, { value: 'vc_office', label: 'VC office' }, { value: 'pro_vc', label: 'PRO VC' } ] }
  ];
  const universityDepartments = [
    { id: 'engineering', label: 'Engineering', departments: [ { value: 'btech_cse', label: 'B.Tech (Computer Science)' }, { value: 'btech_ece', label: 'B.Tech (Electronics & Communication)' }, { value: 'btech_civil', label: 'B.Tech (Civil Engineering)' }, { value: 'btech_mechanical', label: 'B.Tech (Mechanical Engineering)' }, { value: 'btech_electrical', label: 'B.Tech (Electrical Engineering)' }, ]},
    { id: 'management', label: 'Management', departments: [ { value: 'mba_general', label: 'MBA (General)' }, { value: 'mba_finance', label: 'MBA (Finance)' }, { value: 'mba_marketing', label: 'MBA (Marketing)' }, { value: 'mba_hr', label: 'MBA (Human Resources)' }, ]},
    { id: 'computer_applications', label: 'Computer Applications', departments: [ { value: 'mca', label: 'MCA' }, { value: 'bca', label: 'BCA' }, ]},
    { id: 'science', label: 'Science', departments: [ { value: 'msc_physics', label: 'M.Sc. (Physics)' }, { value: 'msc_chemistry', label: 'M.Sc. (Chemistry)' }, { value: 'msc_mathematics', label: 'M.Sc. (Mathematics)' }, { value: 'bsc', label: 'B.Sc.' }, ]},
    { id: 'arts', label: 'Arts & Humanities', departments: [ { value: 'ba_english', label: 'BA (English)' }, { value: 'ba_history', label: 'BA (History)' }, { value: 'ma_economics', label: 'MA (Economics)' }, ]},
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-13rem)] bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-3xl mx-auto shadow-lg border-0 animate-fade-in">
        <CardHeader className="space-y-1 bg-university-primary text-white rounded-t-lg">
          <CardTitle className="text-2xl font-display text-center">Faculty Registration</CardTitle>
          <CardDescription className="text-white/80 text-center">
            Register a new faculty member
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="registration_no">Registration No. <span className="text-red-500">*</span></Label>
              <Input id="registration_no" name="registration_no" placeholder="Enter registration number" value={formData.registration_no} onChange={handleChange} className="university-input" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" placeholder="Enter full name" value={formData.name} onChange={handleChange} className="university-input" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name</Label>
              <Input id="father_name" name="father_name" placeholder="Enter father's name" value={formData.father_name} onChange={handleChange} className="university-input" />
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
                <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} className="university-input" />
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
              <Input id="primary_email" name="primary_email" type="email" placeholder="Enter primary email" value={formData.primary_email} onChange={handleChange} className="university-input" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="official_email">Official Email</Label>
              <Input id="official_email" name="official_email" type="email" placeholder="Enter official email" value={formData.official_email} onChange={handleChange} className="university-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_no">Contact Number</Label>
              <Input id="contact_no" name="contact_no" placeholder="Enter contact number" value={formData.contact_no} onChange={handleChange} className="university-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" placeholder="Enter address" value={formData.address} onChange={handleChange} className="university-input" />
            </div>
            {/* School and Department side by side */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">School <span className="text-red-500">*</span></Label>
                <Select value={formData.school} onValueChange={(value) => handleSelectChange('school', value)} required>
                  <SelectTrigger className="university-select">
                    <SelectValue placeholder="Select School" />
                  </SelectTrigger>
                  <SelectContent>
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id.toString()}>{school.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                          <SelectItem key={dept.value} value={dept.value}>{dept.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <Input id="designation" name="designation" placeholder="Enter designation" value={formData.designation} onChange={handleChange} className="university-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="qualification">Qualification</Label>
                <Input id="qualification" name="qualification" placeholder="Enter qualification" value={formData.qualification} onChange={handleChange} className="university-input" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Experience</Label>
                <Input id="experience" name="experience" placeholder="Enter experience" value={formData.experience} onChange={handleChange} className="university-input" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="joining_date">Joining Date</Label>
                <Input id="joining_date" name="joining_date" type="date" value={formData.joining_date} onChange={handleChange} className="university-input" />
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
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
              <Input id="password" name="password" type="password" placeholder="Create a password" value={formData.password} onChange={handleChange} className="university-input" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password <span className="text-red-500">*</span></Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} className="university-input" required />
            </div>
            <Button type="submit" className="w-full bg-university-primary hover:bg-university-secondary mt-6 md:col-span-2" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Faculty'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacultyRegistration; 