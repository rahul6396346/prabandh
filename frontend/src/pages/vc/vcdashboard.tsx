import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import authService, { Faculty } from "@/services/authService";
import {
  Calendar,
  CalendarDays,
  Clock,
  BookOpen,
  Users,
  FileText,
  CheckSquare,
  Award,
  Briefcase,
  MessageSquare,
  Bell,
  BookMarked,
  Presentation,
  HelpCircle,
  Calendar as CalendarIcon,
  ChevronRight,
  Mail,
  Phone,
  User,
  ClipboardList,
  PanelRight,
  BarChart3,
  FileCheck,
  BookOpenCheck,
  HeartPulse,
  CalendarClock,
  UserCircle,
  Building,
  GraduationCap,
  FileSpreadsheet,
  Banknote,
  LineChart,
  UserCog,
  FileBarChart,
  Fingerprint,
  Database,
} from "lucide-react";

// Progress bar component
const ProgressBar = ({ value, max, label, color = "bg-[#8B0000]" }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-xs">
      <span className="font-medium">{label}</span>
      <span>{value}/{max}</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div 
        className={`h-full ${color} rounded-full transition-all duration-500 ease-in-out`} 
        style={{ width: `${(value / max) * 100}%` }}
      ></div>
    </div>
  </div>
);

// Stats card component
const StatsCard = ({ icon, title, value, bgColor, textColor }) => {
  const Icon = icon;
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border-0">
      <div className={`${bgColor} h-1.5 w-full`}></div>
      <CardContent className="p-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold mt-1 ${textColor}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-full ${bgColor} bg-opacity-20`}>
            <Icon className={`h-5 w-5 ${textColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const VCDashboard = () => {
  const [vcDetails, setVcDetails] = useState({
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
      setVcDetails({
        name: currentUser.name,
        id: currentUser.registration_no,
        position: currentUser.designation || "Vice Chancellor",
        department: currentUser.department || "ITM University",
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
    { name: "Administration", icon: Users, path: "/vc/administration/executive-committee", color: "text-blue-600" },
    { name: "Leave Approvals", icon: CheckSquare, path: "/vc/leave/approvals", color: "text-green-600" },
    { name: "DCS System", icon: Database, path: "/vc/dcs/student-details", color: "text-purple-600" },
    { name: "Ceremony Attendance", icon: Calendar, path: "/vc/ceremony/attendance", color: "text-amber-600" },
    { name: "Biometric System", icon: Fingerprint, path: "/vc/biometric/attendance", color: "text-cyan-600" },
    { name: "Reports & Analytics", icon: BarChart3, path: "/vc/reports", color: "text-[#8B0000]" },
    { name: "Leave Applications", icon: CalendarClock, path: "/vc/leave/apply", color: "text-teal-600" },
    { name: "Notesheet", icon: FileText, path: "/vc/notesheet", color: "text-indigo-600" },
  ];

  // Upcoming tasks mock data
  const upcomingTasks = [
    { id: 1, task: "Faculty Performance Review", time: "10:30 AM - 11:30 AM", location: "HOD Office", description: "Quarterly Faculty Assessment" },
    { id: 2, task: "Department Meeting", time: "01:00 PM - 03:00 PM", location: "Conference Room", description: "Monthly Department Review" },
  ];

  return (
    <div className="p-6 pb-20 space-y-6 bg-[#f9fafb]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {vcDetails.name}!</h1>
            <p className="text-white/80 mt-1">{today.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex gap-1 items-center">
              <span className="font-medium">ID: {vcDetails.id}</span>
            </Badge>
            <Badge variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex gap-1 items-center">
              {vcDetails.position}
            </Badge>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={Users} 
          title="Total Faculty" 
          value="245" 
          bgColor="bg-blue-500" 
          textColor="text-blue-800" 
        />
        <StatsCard 
          icon={GraduationCap} 
          title="Total Students" 
          value="3,250" 
          bgColor="bg-green-500" 
          textColor="text-green-700" 
        />
        <StatsCard 
          icon={Building} 
          title="Departments" 
          value="18" 
          bgColor="bg-amber-500" 
          textColor="text-amber-700" 
        />
        <StatsCard 
          icon={FileCheck} 
          title="Pending Approvals" 
          value="12" 
          bgColor="bg-purple-500" 
          textColor="text-purple-700" 
        />
      </div>

      {/* VC Profile and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VC Profile Card */}
        <Card className="border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-[#8B0000]" />
              VC Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#8B0000] to-[#AA0000] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {vcDetails.name.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="font-medium">{vcDetails.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">ID:</span>
                <span className="font-medium">{vcDetails.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Position:</span>
                <span className="font-medium">{vcDetails.position}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Institution:</span>
                <span className="font-medium">{vcDetails.department}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">VC Since:</span>
                <span className="font-medium">{vcDetails.since}</span>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/vc/profile">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300 flex flex-col">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[#8B0000]" />
              Today's Meetings & Tasks
            </CardTitle>
            <CardDescription>
              Your upcoming meetings and tasks for today
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-3">
            <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}>
              {[
                { id: 1, task: "Executive Committee Meeting", time: "10:30 AM - 11:30 AM", location: "VC Office", description: "Monthly Executive Committee Review" },
                { id: 2, task: "University Board Meeting", time: "01:00 PM - 03:00 PM", location: "Board Room", description: "Quarterly University Board Meeting" },
                { id: 3, task: "Faculty Senate Meeting", time: "03:00 PM - 04:00 PM", location: "Senate Hall", description: "Academic Policy Discussion" },
                { id: 4, task: "Strategic Planning Session", time: "10:00 AM - 11:00 AM", location: "VC Office", description: "University Strategic Planning" },
                { id: 5, task: "Ceremony Coordination", time: "02:00 PM - 03:00 PM", location: "Event Hall", description: "Upcoming Convocation Planning" },
              ].map((task) => (
                <div key={task.id} className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-[#8B0000]/20 hover:bg-[#F3E5E5]/10 transition-colors">
                  <div className="mr-4 p-3 bg-[#8B0000]/10 rounded-full">
                    <BookOpenCheck className="h-6 w-6 text-[#8B0000]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{task.task}</h4>
                    <div className="mt-1 space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{task.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>{task.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span>{task.description}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#8B0000] hover:bg-[#8B0000]/10 hover:text-[#8B0000]">
                    View
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ))}
              {upcomingTasks.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No tasks scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="mt-auto border-t bg-[#F9FAFB]">
            <div className="text-center py-3">
              <Button variant="link" className="text-[#8B0000]">
                View All Meetings
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Notice Board */}
        <Card className="border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300 flex flex-col">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#8B0000]" />
              University Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-3">
            <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="border-b border-gray-100 pb-4 group hover:bg-[#F3E5E5]/20 p-2 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#8B0000] hover:bg-[#8B0000]/90">New</Badge>
                    <p className="font-medium group-hover:text-[#8B0000] transition-colors">University Notice #{item}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This is a sample notice for the university administration.
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">Posted on: June {item}, 2025</p>
                    <Button variant="ghost" size="sm" className="h-8 text-[#8B0000] hover:bg-[#8B0000]/10 hover:text-[#8B0000]">
                      Read More
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="mt-auto border-t bg-[#F9FAFB]">
            <div className="items-center p-6 bg-[#F9FAFB] px-4 py-3 flex justify-center">
              <Button variant="link" className="text-[#8B0000] hover:underline">
                View All Notices
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VCDashboard;