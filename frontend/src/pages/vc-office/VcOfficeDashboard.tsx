import { useEffect, useState } from "react";
import { getVcOfficeDashboard } from "@/services/vcOfficeService";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  FileCheck,
  CalendarClock,
  Bell,
  BookOpenCheck,
  Clock,
  Briefcase,
  FileText,
  ChevronRight,
  PanelRight,
  User,
  Upload,
  FileBarChart,
  Archive,
} from "lucide-react";
import authService from "@/services/authService";
import StatsCard from "@/components/dashboard/StatsCard";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const quickActions = [
  { name: "Notices", icon: FileText, path: "/vcoffice/notices", color: "text-blue-600" },
  { name: "Circular Upload", icon: Upload, path: "/vcoffice/uploads", color: "text-purple-600" },
  { name: "Faculty Feedback", icon: Users, path: "/vcoffice/faculty-reviews", color: "text-green-600" },
  { name: "Track Files", icon: Archive, path: "/vcoffice/track-files", color: "text-amber-600" },
  { name: "View Reports", icon: FileBarChart, path: "/vcoffice/reports", color: "text-red-600" },
];

const tasks = [
  { id: 1, task: "Review Faculty Feedback", time: "09:00 AM - 10:00 AM", location: "VC Office", description: "Review feedback submissions" },
  { id: 2, task: "Approve Circulars", time: "11:00 AM - 12:00 PM", location: "VC Office", description: "Pending circular approvals" },
  { id: 3, task: "Meeting with Registrar", time: "02:00 PM - 03:00 PM", location: "Conference Room", description: "Monthly review meeting" },
];

const notices = [
  { id: 1, title: "New Circular Uploaded", date: "June 1, 2025", content: "A new circular has been uploaded for review." },
  { id: 2, title: "Faculty Feedback Reminder", date: "June 2, 2025", content: "Reminder to review faculty feedback forms." },
  { id: 3, title: "Leave Request Update", date: "June 3, 2025", content: "There are new leave requests pending approval." },
];

const VcOfficeDashboard = () => {
  const [vcDetails, setVcDetails] = useState({
    name: "",
    id: "",
    position: "",
    department: "",
    since: "",
  });
  const [stats, setStats] = useState({
    faculty_members: 0,
    students: 0,
    courses: 0,
    pending_approvals: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setVcDetails({
        name: user.name,
        id: String(user.registration_no || user.id),
        position: user.designation || "Vice Chancellor",
        department: user.department || "University Administration",
        since: user.joining_date || "",
      });
    }
    const token = localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }
    getVcOfficeDashboard(token)
      .then((data) => {
        setStats({
          faculty_members: data?.stats?.faculty_members ?? 0,
          students: data?.stats?.students ?? 0,
          courses: data?.stats?.courses ?? 0,
          pending_approvals: data?.stats?.pending_approvals ?? 0,
        });
        setLoading(false);
      })
      .catch(() => {
        localStorage.clear();
        navigate("/login");
      });
  }, [navigate]);

  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="p-6 pb-20 space-y-6 bg-[#f9fafb]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {vcDetails.name}!</h1>
            <p className="text-white/80 mt-1">{formattedDate}</p>
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
          title="Faculty Members"
          value={loading ? "..." : String(stats.faculty_members)}
          bgColor="bg-blue-500"
          textColor="text-blue-800"
        />
        <StatsCard
          icon={GraduationCap}
          title="Students"
          value={loading ? "..." : String(stats.students)}
          bgColor="bg-green-500"
          textColor="text-green-700"
        />
        <StatsCard
          icon={BookOpen}
          title="Courses"
          value={loading ? "..." : String(stats.courses)}
          bgColor="bg-amber-500"
          textColor="text-amber-700"
        />
        <StatsCard
          icon={FileCheck}
          title="Pending Approvals"
          value={loading ? "..." : String(stats.pending_approvals)}
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
              <User className="h-5 w-5 text-[#8B0000]" /> VC Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#8B0000] to-[#AA0000] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {vcDetails.name.split(" ").map((n) => n[0]).join("")}
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
                <span className="text-sm font-medium text-gray-500">Department:</span>
                <span className="font-medium">{vcDetails.department}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Since:</span>
                <span className="font-medium">{vcDetails.since}</span>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/vcoffice/profile">
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
              <PanelRight className="h-5 w-5 text-[#8B0000]" /> Quick Actions
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

      {/* Tasks and Notice Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300 flex flex-col">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[#8B0000]" /> Today's Tasks
            </CardTitle>
            <CardDescription>Your upcoming tasks for today</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-3">
            <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}>
              {tasks.map((task) => (
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
              {tasks.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <CalendarClock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No tasks scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="mt-auto border-t bg-[#F9FAFB]">
            <div className="text-center py-3">
              <Button variant="link" className="text-[#8B0000]">
                View All Tasks
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Notice Board */}
        <Card className="border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300 flex flex-col">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Bell className="h-5 w-5 text-[#8B0000]" /> Notice Board
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-3">
            <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}>
              {notices.map((notice) => (
                <div key={notice.id} className="border-b border-gray-100 pb-4 group hover:bg-[#F3E5E5]/20 p-2 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#8B0000] hover:bg-[#8B0000]/90">New</Badge>
                    <p className="font-medium group-hover:text-[#8B0000] transition-colors">{notice.title}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notice.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">Posted on: {notice.date}</p>
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

export default VcOfficeDashboard; 