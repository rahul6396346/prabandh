import React, { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";

// Helper to convert DD/MM/YYYY or other formats to YYYY-MM-DD
function toInputDateFormat(dateStr: string) {
  if (!dateStr) return "";
  // If already in yyyy-MM-dd, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  // Try to convert DD/MM/YYYY or D/M/YYYY
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length === 3) {
    // If DD/MM/YYYY
    if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    // If YYYY/MM/DD
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }
  return dateStr;
}

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
    researchInterests: "",
    category: "General",
    emptype: "Faculty"
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentsData, setDocumentsData] = useState({});
  const [uploadingDocType, setUploadingDocType] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputsRef = useRef({});
  const [facultyId, setFacultyId] = useState<number | null>(null);

  const fetchFacultyDetails = async () => {
    try {
      const res = await axiosInstance.get('/api/auth/user/');
      const data = res.data;
      setFacultyDetails({
        name: data.name || "Faculty Name",
        employeeCode: data.registration_no || "FACULTY001",
        email: data.primary_email || "faculty@example.com",
        phone: data.contact_no || "",
        dateOfBirth: data.dob || "",
        gender: data.gender || "",
        bloodGroup: data.blood_group || "",
        address: data.address || "",
        fatherName: data.father_name || "",
        motherName: data.mother_name || "",
        aadharNumber: data.aadhar_number || "",
        department: data.department || "",
        designation: data.designation || "",
        joiningDate: data.joining_date || "",
        qualification: data.qualification || "",
        experience: data.experience || "",
        specialization: data.specialization || "",
        researchInterests: data.research_interests || "",
        category: data.category || "General",
        emptype: data.emptype || "Faculty",
      });
      setFacultyId(data.id);
      if (data.profile_image) {
        setProfileImage(data.profile_image);
      }
    } catch (err) {
      // handle error if needed
    }
  };

  const fetchDocuments = async () => {
    if (!facultyId) return;
    try {
      const res = await axiosInstance.get(`/api/auth/faculty/${facultyId}/documents`);
      const docs = res.data;
      // Map by document_type for easy lookup
      const docMap = {};
      (docs.results || docs).forEach((doc) => {
        docMap[doc.document_type] = doc;
      });
      setDocumentsData(docMap);
    } catch (err) {
      // handle error
    }
  };

  useEffect(() => {
    // Load faculty details from auth service and faculty info hook
    fetchFacultyDetails();
  }, [facultyInfo]);

  useEffect(() => {
    if (activeTab === "documents") {
      fetchDocuments();
    }
  }, [activeTab, facultyId]);

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

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    // Optionally reload data from backend to discard changes
    window.location.reload();
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFacultyDetails((prev) => ({ ...prev, [name]: value }));
  };
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        name: facultyDetails.name,
        primary_email: facultyDetails.email,
        dob: facultyDetails.dateOfBirth,
        gender: facultyDetails.gender,
        address: facultyDetails.address,
        father_name: facultyDetails.fatherName,
        mother_name: facultyDetails.motherName,
        aadhar_number: facultyDetails.aadharNumber,
        department: facultyDetails.department,
        designation: facultyDetails.designation,
        joining_date: facultyDetails.joiningDate,
        qualification: facultyDetails.qualification,
        experience: facultyDetails.experience,
        specialization: facultyDetails.specialization,
        research_interests: facultyDetails.researchInterests,
        contact_no: facultyDetails.phone,
        blood_group: facultyDetails.bloodGroup,
        registration_no: facultyDetails.employeeCode,
        category: facultyDetails.category,
        emptype: facultyDetails.emptype,
        // Add other fields as needed
      };
      await axiosInstance.put('/api/auth/user/', payload);
      await fetchFacultyDetails(); // Refresh data after save
      toast({ title: 'Profile updated successfully', variant: 'default' });
      setIsEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed.');
      toast({ title: 'Update failed', description: err.response?.data?.error || 'Update failed.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDocUploadClick = (docType) => {
    if (fileInputsRef.current[docType]) fileInputsRef.current[docType].click();
  };

  const handleDocFileChange = async (e, docType) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds 5MB.");
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Invalid file type. Only PDF, JPG, PNG allowed.");
      return;
    }
    setUploadingDocType(docType);
    setUploadError("");
    const formData = new FormData();
    formData.append("document_type", docType);
    formData.append("file", file);
    try {
      await axiosInstance.post(`/api/auth/faculty/${facultyId}/upload-document`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchDocuments();
    } catch (err) {
      setUploadError(err.response?.data?.error || "Upload failed.");
    } finally {
      setUploadingDocType("");
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
                  {isEditing ? (
                    <Input name="name" value={facultyDetails.name} onChange={handleChange} />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.name}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Employee ID</label>
                <div className="mt-1 flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-[#8B0000]" />
                  {isEditing ? (
                    <Input name="employeeCode" value={facultyDetails.employeeCode} onChange={handleChange} disabled />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.employeeCode}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Email Address</label>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-[#8B0000]" />
                  {isEditing ? (
                    <Input name="email" value={facultyDetails.email} onChange={handleChange} />
                  ) : (
                    <span className="font-medium text-blue-600">{facultyDetails.email}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                <div className="mt-1 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-[#8B0000]" />
                  {isEditing ? (
                    <Input name="phone" value={facultyDetails.phone} onChange={handleChange} />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.phone}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Date of Birth</label>
                <div className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-[#8B0000]" />
                  {isEditing ? (
                    <Input name="dateOfBirth" value={toInputDateFormat(facultyDetails.dateOfBirth)} onChange={handleChange} type="date" />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.dateOfBirth}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Gender</label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8B0000]" />
                  {isEditing ? (
                    <select name="gender" value={facultyDetails.gender} onChange={handleChange} className="border rounded px-2 py-1">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.gender}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Blood Group</label>
                <div className="mt-1 flex items-center gap-2">
                  {isEditing ? (
                    <Input name="bloodGroup" value={facultyDetails.bloodGroup} onChange={handleChange} />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.bloodGroup}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</label>
                <div className="mt-1 flex items-center gap-2">
                  {isEditing ? (
                    <Input name="category" value={facultyDetails.category} onChange={handleChange} />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.category}</span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address</label>
                <div className="mt-1 flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-[#8B0000] mt-0.5" />
                  {isEditing ? (
                    <Textarea name="address" value={facultyDetails.address} onChange={handleChange} />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.address}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Father's Name</label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8B0000]" />
                  {isEditing ? (
                    <Input name="fatherName" value={facultyDetails.fatherName} onChange={handleChange} />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.fatherName}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Mother's Name</label>
                <div className="mt-1 flex items-center gap-2">
                  <User className="h-4 w-4 text-[#8B0000]" />
                  {isEditing ? (
                    <Input name="motherName" value={facultyDetails.motherName} onChange={handleChange} />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.motherName}</span>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Aadhar Number</label>
                <div className="mt-1 flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-[#8B0000]" />
                  {isEditing ? (
                    <Input name="aadharNumber" value={facultyDetails.aadharNumber} onChange={handleChange} maxLength={12} />
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.aadharNumber}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Employee Type</label>
                <div className="mt-1 flex items-center gap-2">
                  {isEditing ? (
                    <select name="emptype" value={facultyDetails.emptype} onChange={handleChange} className="border rounded px-2 py-1">
                      <option value="Faculty">Faculty</option>
                      <option value="HR">HR</option>
                      <option value="HOD">HOD</option>
                      <option value="Dean">Dean</option>
                      <option value="VC">VC</option>
                      <option value="Registrar">Registrar</option>
                      <option value="Deputy Registrar">Deputy Registrar</option>
                    </select>
                  ) : (
                    <span className="font-medium text-gray-900">{facultyDetails.emptype}</span>
                  )}
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
              {isEditing ? (
                <Input name="department" value={facultyDetails.department} onChange={handleChange} />
              ) : (
                <span className="font-medium text-gray-900">{facultyDetails.department}</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Designation</label>
            <div className="mt-1 flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-[#8B0000]" />
              {isEditing ? (
                <Input name="designation" value={facultyDetails.designation} onChange={handleChange} />
              ) : (
                <span className="font-medium text-gray-900">{facultyDetails.designation}</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Joining Date</label>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#8B0000]" />
              {isEditing ? (
                <Input name="joiningDate" value={toInputDateFormat(facultyDetails.joiningDate)} onChange={handleChange} type="date" />
              ) : (
                <span className="font-medium text-gray-900">{facultyDetails.joiningDate}</span>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Experience</label>
            <div className="mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#8B0000]" />
              {isEditing ? (
                <Input name="experience" value={facultyDetails.experience} onChange={handleChange} />
              ) : (
                <span className="font-medium text-gray-900">{facultyDetails.experience}</span>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Highest Qualification</label>
            <div className="mt-1 flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-[#8B0000]" />
              {isEditing ? (
                <Input name="qualification" value={facultyDetails.qualification} onChange={handleChange} />
              ) : (
                <span className="font-medium text-gray-900">{facultyDetails.qualification}</span>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Specialization</label>
            <div className="mt-1 flex items-start gap-2">
              <Award className="h-4 w-4 text-[#8B0000] mt-0.5" />
              {isEditing ? (
                <Textarea name="specialization" value={facultyDetails.specialization} onChange={handleChange} />
              ) : (
                <span className="font-medium text-gray-900">{facultyDetails.specialization}</span>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Research Interests</label>
            <div className="mt-1 flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-[#8B0000] mt-0.5" />
              {isEditing ? (
                <Textarea name="researchInterests" value={facultyDetails.researchInterests} onChange={handleChange} />
              ) : (
                <span className="font-medium text-gray-900">{facultyDetails.researchInterests}</span>
              )}
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
      { name: "Research Publications", icon: BookOpen },
    ];

    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b">
          <CardTitle className="text-lg font-semibold text-gray-800">Uploaded Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {uploadError && <div className="text-red-600 text-sm mb-2">{uploadError}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc, index) => {
              const Icon = doc.icon;
              const uploaded = documentsData[doc.name];
              const isUploading = uploadingDocType === doc.name;
              return (
                <div key={index} className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    {uploaded ? (
                      uploaded.file.endsWith('.pdf') ? (
                        <a href={uploaded.file} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-8 w-8 text-gray-400" />
                        </a>
                      ) : (
                        <a href={uploaded.file} target="_blank" rel="noopener noreferrer">
                          <img src={uploaded.file} alt={doc.name} className="h-8 w-8 object-contain" />
                        </a>
                      )
                    ) : (
                      <Icon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900 text-center mb-2">{doc.name}</span>
                  <input
                    type="file"
                    accept=".pdf,image/jpeg,image/png"
                    style={{ display: "none" }}
                    ref={el => (fileInputsRef.current[doc.name] = el)}
                    onChange={e => handleDocFileChange(e, doc.name)}
                    disabled={isUploading}
                  />
                  <Button
                    variant="outline"
                    className="text-[#8B0000] border-[#8B0000] hover:bg-[#8B0000]/10"
                    onClick={() => handleDocUploadClick(doc.name)}
                    disabled={isUploading}
                  >
                    {uploaded ? (isUploading ? "Uploading..." : "Replace") : (isUploading ? "Uploading..." : "Upload")}
                  </Button>
                  {uploaded && (
                    <a
                      href={uploaded.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 text-blue-600 text-xs underline"
                    >
                      View / Download
                    </a>
                  )}
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
          {!isEditing ? (
            <Button className="bg-[#8B0000] hover:bg-[#AA0000] text-white" onClick={handleEdit}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button className="bg-[#8B0000] hover:bg-[#AA0000] text-white" onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                Cancel
              </Button>
            </>
          )}
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
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === "personal" && renderPersonalInformation()}
        {activeTab === "academic" && renderAcademicDetails()}
        {activeTab === "documents" && renderDocuments()}
      </div>
    </div>
  );
}
