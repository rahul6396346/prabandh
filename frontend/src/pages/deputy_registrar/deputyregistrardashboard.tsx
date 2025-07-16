import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import authService from "@/services/authService";
import {
  FileText,
  FileArchive,
  FileSearch,
  FileSignature,
  FileUp,
  FileDown,
  FileCheck,
  FilePlus,
  User,
  PanelRight,
  Clock,
  Building
} from "lucide-react";

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, bgColor, textColor }) => (
  <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${bgColor} bg-opacity-10`}>
          <Icon className={`h-6 w-6 ${textColor}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

const DeputyRegistrarDashboard = () => {
  const [deputyRegistrarDetails, setDeputyRegistrarDetails] = useState({
    name: "",
    id: "",
    position: "",
    department: "",
    since: "",
  });
  
  // Load the logged-in user's details
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setDeputyRegistrarDetails({
        name: currentUser.name,
        id: currentUser.registration_no,
        position: currentUser.designation || "Deputy Registrar",
        department: currentUser.department || "Administration",
        since: "", // Not available in the Faculty interface
      });
    }
  }, []);

  // Current date and time
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  // Quick action links with icons
  const quickActions = [
    { name: "Document Management", icon: FileText, path: "/deputy_registrar/documents", color: "text-blue-600" },
    { name: "Records Archive", icon: FileArchive, path: "/deputy_registrar/archive", color: "text-green-600" },
    { name: "Document Search", icon: FileSearch, path: "/deputy_registrar/search", color: "text-purple-600" },
    { name: "Approvals", icon: FileSignature, path: "/deputy_registrar/approvals", color: "text-amber-600" },
    { name: "Upload Documents", icon: FileUp, path: "/deputy_registrar/upload", color: "text-cyan-600" },
    { name: "Download Reports", icon: FileDown, path: "/deputy_registrar/downloads", color: "text-[#8B0000]" },
    { name: "Document Tracking", icon: FileCheck, path: "/deputy_registrar/tracking", color: "text-teal-600" },
    { name: "Document Requests", icon: FilePlus, path: "/deputy_registrar/requests", color: "text-indigo-600" },
  ];

  // Recent activities mock data
  const recentActivities = [
    { id: 1, activity: "New Document Uploaded", time: "10:30 AM", type: "upload" },
    { id: 2, activity: "Document Approved", time: "11:45 AM", type: "approval" },
    { id: 3, activity: "Document Archived", time: "02:15 PM", type: "archive" },
    { id: 4, activity: "New Request Received", time: "03:30 PM", type: "request" },
  ];

  return (
    <div className="p-6 pb-20 space-y-6 bg-[#f9fafb]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {deputyRegistrarDetails.name}!</h1>
            <p className="text-white/80 mt-1">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex gap-1 items-center">
              <span className="font-medium">ID: {deputyRegistrarDetails.id}</span>
            </Badge>
            <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex gap-1 items-center">
              {deputyRegistrarDetails.position}
            </Badge>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={FileText} 
          title="Total Documents" 
          value="1,234" 
          bgColor="bg-blue-500" 
          textColor="text-blue-800" 
        />
        <StatsCard 
          icon={FileCheck} 
          title="Pending Approvals" 
          value="45" 
          bgColor="bg-amber-500" 
          textColor="text-amber-700" 
        />
        <StatsCard 
          icon={FileArchive} 
          title="Archived Files" 
          value="567" 
          bgColor="bg-green-500" 
          textColor="text-green-700" 
        />
        <StatsCard 
          icon={FileSearch} 
          title="Recent Searches" 
          value="89" 
          bgColor="bg-purple-500" 
          textColor="text-purple-700" 
        />
      </div>

      {/* Deputy Registrar Profile and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deputy Registrar Profile Card */}
        <Card className="border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-[#8B0000]" />
              Deputy Registrar Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#8B0000] to-[#AA0000] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {deputyRegistrarDetails.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="font-medium">{deputyRegistrarDetails.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">ID:</span>
                <span className="font-medium">{deputyRegistrarDetails.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Position:</span>
                <span className="font-medium">{deputyRegistrarDetails.position}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Department:</span>
                <span className="font-medium">{deputyRegistrarDetails.department}</span>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/deputy_registrar/profile">
                <Button variant="outline" className="w-full text-[#8B0000] border-[#8B0000] hover:bg-[#8B0000]/10 hover:text-[#8B0000]">
                  <User className="mr-2 h-4 w-4" /> Update Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <PanelRight className="h-5 w-5 text-[#8B0000]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Link 
                    key={index} 
                    to={action.path}
                    className="flex flex-col items-center justify-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md hover:border-[#8B0000]/30 transition-all group"
                  >
                    <div className="p-3 rounded-full bg-gray-50 group-hover:bg-[#8B0000]/10 transition-colors mb-3">
                      <Icon className={`h-6 w-6 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-center">{action.name}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="border-0 shadow-md rounded-lg overflow-hidden">
        <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#8B0000]" />
            Recent Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-gray-50">
                    {activity.type === 'upload' && <FileUp className="h-5 w-5 text-blue-600" />}
                    {activity.type === 'approval' && <FileCheck className="h-5 w-5 text-green-600" />}
                    {activity.type === 'archive' && <FileArchive className="h-5 w-5 text-purple-600" />}
                    {activity.type === 'request' && <FilePlus className="h-5 w-5 text-amber-600" />}
                  </div>
                  <span className="font-medium">{activity.activity}</span>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeputyRegistrarDashboard; 