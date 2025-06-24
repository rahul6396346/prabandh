import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import authService from "@/services/authService";
import {
  Calendar,
  CalendarCheck,
  BookOpen,
  CheckSquare,
  FileCheck,
  CalendarClock,
  BookMarked,
  Presentation,
  User,
  CalendarDays,
  Award,
  PanelRight,
  BookOpenCheck,
  Clock,
  Briefcase,
  Users,
  ChevronRight,
  Bell
} from "lucide-react";

interface Student {
  registration_no: string;
  name: string;
  primary_email: string;
  department?: string;
  profile?: {
    programme?: string;
    branch?: string;
    semester?: string;
    section?: string;
    batch?: string;
  };
}

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

const StudentDashboard = () => {
  const [studentDetails, setStudentDetails] = useState({
    name: "",
    id: "",
    programme: "",
    branch: "",
    semester: "",
    section: "",
    batch: "",
  });

  // Load the logged-in user's details
  useEffect(() => {
    const currentUser = authService.getCurrentUser() as Student | null;
    if (currentUser) {
      setStudentDetails({
        name: currentUser.name,
        id: currentUser.registration_no,
        programme: currentUser.profile?.programme || "B.Tech",
        branch: currentUser.profile?.branch || currentUser.department || "Computer Science",
        semester: currentUser.profile?.semester || "",
        section: currentUser.profile?.section || "",
        batch: currentUser.profile?.batch || "",
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
    { name: "Class Schedule", icon: Calendar, path: "/student/class-schedule", color: "text-blue-600" },
    { name: "Attendance Report", icon: CalendarCheck, path: "/student/attendance-report", color: "text-green-600" },
    { name: "Course Materials", icon: BookOpen, path: "/student/course-materials", color: "text-purple-600" },
    { name: "Assignments", icon: CheckSquare, path: "/student/view-assignments", color: "text-amber-600" },
    { name: "Exam Results", icon: FileCheck, path: "/student/results", color: "text-cyan-600" },
    { name: "Apply for Leave", icon: CalendarClock, path: "/student/leave/apply", color: "text-[#8B0000]" },
    { name: "Library", icon: BookMarked, path: "/student/library/browse", color: "text-teal-600" },
    { name: "Campus Events", icon: Presentation, path: "/student/campus/events", color: "text-indigo-600" },
  ];

  // Upcoming classes mock data
  const upcomingClasses = [
    { id: 1, subject: "Data Structures", time: "10:30 AM - 11:30 AM", room: "Lab 302", faculty: "Dr. Amit Kumar" },
    { id: 2, subject: "Algorithm Design", time: "01:00 PM - 02:00 PM", room: "Room 201", faculty: "Dr. Priya Verma" },
    { id: 3, subject: "Database Management", time: "03:00 PM - 04:00 PM", room: "Lab 105", faculty: "Prof. Rajesh Singh" },
  ];

  return (
    <div className="p-6 pb-20 space-y-6 bg-[#f9fafb]">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-[#8B0000] to-[#AA0000] rounded-lg shadow-lg p-6 text-white mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-base font-semibold">Today's Classes</h3>
            <h1 className="text-2xl font-bold">Welcome, {studentDetails.name}!</h1>
            <p className="text-white/80 mt-1">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 hover:bg-white/30 text-white py-1.5 px-3 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> ID: {studentDetails.id}
            </Badge>
            <Badge className="bg-white/20 hover:bg-white/30 text-white py-1.5 px-3">{studentDetails.programme} - {studentDetails.branch}</Badge>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={BookOpen} 
          title="Enrolled Courses" 
          value="8" 
          bgColor="bg-blue-500" 
          textColor="text-blue-800" 
        />
        <StatsCard 
          icon={CalendarDays} 
          title="Attendance" 
          value="92%" 
          bgColor="bg-green-500" 
          textColor="text-green-700" 
        />
        <StatsCard 
          icon={FileCheck} 
          title="Assignments" 
          value="12/15" 
          bgColor="bg-amber-500" 
          textColor="text-amber-700" 
        />
        <StatsCard 
          icon={Award} 
          title="CGPA" 
          value="8.7" 
          bgColor="bg-purple-500" 
          textColor="text-purple-700" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Faculty Profile Card */}
        <Card className="border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5 text-[#8B0000]" />
              Student Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="h-24 w-24 rounded-full bg-gradient-to-br from-[#8B0000] to-[#AA0000] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                RS
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Name:</span>
                <span className="font-medium">{studentDetails.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">ID:</span>
                <span className="font-medium">{studentDetails.id}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Programme:</span>
                <span className="font-medium">{studentDetails.programme}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Branch:</span>
                <span className="font-medium">{studentDetails.branch}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-sm font-medium text-gray-500">Semester:</span>
                <span className="font-medium">{studentDetails.semester}</span>
              </div>
            </div>
            <div className="mt-6">
              <Link to="/student/profile">
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
        {/* Today's Schedule */}
        <Card className="col-span-1 lg:col-span-2 border-0 shadow-md rounded-lg overflow-hidden transform hover:shadow-lg transition-all duration-300 flex flex-col">
          <CardHeader className="pb-2 border-b bg-gradient-to-r from-[#f3f4f6] to-[#f9fafb]">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-[#8B0000]" />
              Today's Schedule
            </CardTitle>
            <CardDescription>
              Your upcoming classes for today
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 px-3">
            <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}>
              {[
                { id: 1, subject: "Data Structures", time: "10:30 AM - 11:30 AM", room: "Lab 302", batch: "B.Tech CS (2022-26)" },
                { id: 2, subject: "Algorithm Design", time: "01:00 PM - 02:00 PM", room: "Room 201", batch: "B.Tech CS (2021-25)" },
                { id: 3, subject: "Database Management", time: "03:00 PM - 04:00 PM", room: "Lab 304", batch: "B.Tech CS (2022-26)" },
                { id: 4, subject: "Software Engineering", time: "10:00 AM - 11:00 AM", room: "Room 205", batch: "B.Tech CS (2021-25)" },
                { id: 5, subject: "Computer Networks", time: "02:00 PM - 03:00 PM", room: "Lab 301", batch: "B.Tech CS (2022-26)" },
              ].map((cls) => (
                <div key={cls.id} className="flex items-start p-4 rounded-lg border border-gray-100 hover:border-[#8B0000]/20 hover:bg-[#F3E5E5]/10 transition-colors">
                  <div className="mr-4 p-3 bg-[#8B0000]/10 rounded-full">
                    <BookOpenCheck className="h-6 w-6 text-[#8B0000]" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{cls.subject}</h4>
                    <div className="mt-1 space-y-1 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{cls.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" />
                        <span>Student Profile</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{cls.batch}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-[#8B0000] hover:bg-[#8B0000]/10 hover:text-[#8B0000]">
                    View
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              ))}
              {upcomingClasses.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No classes scheduled for today</p>
                </div>
              )}
            </div>
          </CardContent>
          <div className="mt-auto border-t bg-[#F9FAFB]">
            <div className="text-center py-3">
              <Button variant="link" className="text-[#8B0000]">
                View Full Schedule
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
              Notice Board
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 px-3">
            <div className="max-h-[320px] overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#D1D5DB transparent' }}>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="border-b border-gray-100 pb-4 group hover:bg-[#F3E5E5]/20 p-2 rounded-md transition-colors">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#8B0000] hover:bg-[#8B0000]/90">New</Badge>
                    <p className="font-medium group-hover:text-[#8B0000] transition-colors">Student Notice #{item}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    This is a sample notice for the Student dashboard.
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500">Posted on: May {item}, 2025</p>
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

export default StudentDashboard;
