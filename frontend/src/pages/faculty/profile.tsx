import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Users, 
  GraduationCap,
  FileText,
  Building,
  Award,
  BookOpen,
  Clock,
  IdCard
} from "lucide-react";
import authService from "@/services/authService";
import { useFacultyInfo } from "@/hooks/useFacultyInfo";
import axiosInstance from '@/lib/axios';

export default function FacultyProfile() {
  const facultyInfo = useFacultyInfo();
  const [activeTab, setActiveTab] = useState("personal");
  const [facultyDetails, setFacultyDetails] = useState({
    name: "",
    employeeCode: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    fatherName: "",
    motherName: "",
    aadharNumber: "",
    department: "",
    designation: "",
    joiningDate: "",
    qualification: "",
    experience: "",
    specialization: "",
    researchInterests: ""
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load faculty details from auth service and faculty info hook
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setFacultyDetails({
        name: currentUser.name || facultyInfo.name || "Faculty Name",
        employeeCode: currentUser.registration_no || facultyInfo.id || "FACULTY001",
        email: currentUser.primary_email || facultyInfo.email || "faculty@example.com",
        phone: currentUser.contact_no || "+91 9876543210",
        dateOfBirth: "15/08/1985",
        gender: "Male",
        bloodGroup: "B+",
        address: "Faculty Quarters, ITM University Campus, Gwalior, Madhya Pradesh",
        fatherName: "Father Name",
        motherName: "Mother Name",
        aadharNumber: "1234 5678 9012",
        department: currentUser.department || facultyInfo.department || "Computer Science",
        designation: currentUser.designation || facultyInfo.designation || "Assistant Professor",
        joiningDate: "01/07/2020",
        qualification: "PhD in Computer Science",
        experience: "5 years",
        specialization: "Machine Learning, Data Science",
        researchInterests: "Artificial Intelligence, Deep Learning, Natural Language Processing"
      });
    }
  }, [facultyInfo]);

  // Load profile image from user info if available
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser && (currentUser as any).profile_image) {
      setProfileImage((currentUser as any).profile_image);
    }
  }, [facultyInfo]);

  const getInitials = (name: string) => {
    return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2);
  };

  const tabs = [
    { id: "personal", label: "Personal Information", active: activeTab === "personal" },
    { id: "academic", label: "Academic Details", active: activeTab === "academic" },
    { id: "documents", label: "Documents", active: activeTab === "documents" }
  ];

  const handleUploadClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size exceeds 5MB.');
      return;
    }
    setError(null);
    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Upload
    const formData = new FormData();
    formData.append('profile_image', file);
    setUploading(true);
    try {
      const res = await axiosInstance.patch('/api/auth/profile-image/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setProfileImage(res.data.profile_image);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const renderPersonalInformation = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Profile Picture Section */}
      <div className="lg:col-span-1">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg font-semibold text-gray-800">Profile Picture</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#8B0000] to-[#AA0000] flex items-center justify-center text-white text-3xl font-bold shadow-lg mb-4 overflow-hidden">
              {profileImage ? (
                <img src={profileImage.startsWith('data:') ? profileImage : profileImage.startsWith('http') ? profileImage : `/media/${profileImage}`} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                getInitials(facultyDetails.name)
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
              disabled={uploading}
            />
            <Button variant="outline" className="text-[#8B0000] border-[#8B0000] hover:bg-[#8B0000]/10" onClick={handleUploadClick} disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </CardContent>
        </Card>
      </div>

      {/* Personal Details Section */}
      <div className="lg:col-span-2">
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-lg font-semibold text-gray-800">Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">{facultyDetails.name}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Employee ID</label>
                <div className="mt-1 flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">{facultyDetails.employeeCode}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-blue-600">{facultyDetails.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">{facultyDetails.phone}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">{facultyDetails.dateOfBirth}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gender</label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">{facultyDetails.gender}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Blood Group</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-medium text-gray-900">{facultyDetails.bloodGroup}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-medium text-gray-900">General</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</label>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#8B0000] mt-0.5" />
                  <span className="font-medium text-gray-900">{facultyDetails.address}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Father's Name</label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">{facultyDetails.fatherName}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mother's Name</label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">{facultyDetails.motherName}</span>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Aadhar Number</label>
                <div className="mt-1 flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-[#8B0000]" />
                  <span className="font-medium text-gray-900">{facultyDetails.aadharNumber}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAcademicDetails = () => (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="border-b">
        <CardTitle className="text-lg font-semibold text-gray-800">Academic Information</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Department</label>
            <div className="mt-1 flex items-center gap-2">
              <Building className="h-4 w-4 text-[#8B0000]" />
              <span className="font-medium text-gray-900">{facultyDetails.department}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Designation</label>
            <div className="mt-1 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#8B0000]" />
              <span className="font-medium text-gray-900">{facultyDetails.designation}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Joining Date</label>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#8B0000]" />
              <span className="font-medium text-gray-900">{facultyDetails.joiningDate}</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Experience</label>
            <div className="mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8B0000]" />
              <span className="font-medium text-gray-900">{facultyDetails.experience}</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Highest Qualification</label>
            <div className="mt-1 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#8B0000]" />
              <span className="font-medium text-gray-900">{facultyDetails.qualification}</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Specialization</label>
            <div className="mt-1 flex items-start gap-2">
              <Award className="h-4 w-4 text-[#8B0000] mt-0.5" />
              <span className="font-medium text-gray-900">{facultyDetails.specialization}</span>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Research Interests</label>
            <div className="mt-1 flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-[#8B0000] mt-0.5" />
              <span className="font-medium text-gray-900">{facultyDetails.researchInterests}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderDocuments = () => {
    const documents = [
      { name: "Aadhar Card", icon: FileText },
      { name: "PAN Card", icon: FileText },
      { name: "Passport", icon: FileText },
      { name: "Educational Certificates", icon: GraduationCap },
      { name: "Experience Certificates", icon: Briefcase },
      { name: "Research Publications", icon: BookOpen }
    ];

    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold text-gray-800">Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => {
              const Icon = doc.icon;
              return (
                <div key={index} className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-8 w-8 text-gray-400" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center">{doc.name}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Profile</h1>
        <div className="flex gap-2">
          <Button className="bg-[#8B0000] hover:bg-[#AA0000] text-white">
            Edit Profile
          </Button>
          <Button className="bg-[#8B0000] hover:bg-[#AA0000] text-white">
            Save
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium rounded-t-lg transition-colors ${
              tab.active
                ? "bg-[#8B0000] text-white border-[#8B0000]"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "personal" && renderPersonalInformation()}
        {activeTab === "academic" && renderAcademicDetails()}
        {activeTab === "documents" && renderDocuments()}
      </div>
    </div>
  );
}
