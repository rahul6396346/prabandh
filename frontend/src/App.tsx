import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Unauthorized from "./pages/Unauthorized";
import { ProtectedRoute } from "./components/layout";
import { VCLayout, VCDashboard, EventApprovals } from "./pages/vc";
import { ApprovedRequests as VCApprovedRequests, RejectedRequests as VCRejectedRequests, AllRequests as VCAllRequests, LeaveApprovals as VCLeaveApprovals } from "./pages/vc/approvals";
import { DeanLayout, DeanDashboard } from "./pages/dean";
import { ApprovedRequests as DeanApprovedRequests, RejectedRequests as DeanRejectedRequests, AllRequests as DeanAllRequests, LeaveApprovals as DeanLeaveApprovals } from "./pages/dean/approvals";
import { FacultyLayout, FacultyDashboard, FacultyProfile } from "./pages/faculty";
import { Apply, ApplyForm } from "./pages/faculty/leave";
import ArrivalDeparture from "./pages/faculty/leave/arrival-departure";
import LeaveReports from "./pages/faculty/leave/leave-reports";
import DutySlipReports from "./pages/faculty/leave/duty-reports";
import { HRLayout, HRDashboard } from "./pages/hr";
import { AddStaff } from "./pages/hr/staff";
import { ApprovedRequests, RejectedRequests, AllRequests, LeaveApprovals } from "./pages/hr/approvals";
import { HODLayout, HODDashboard } from "./pages/hod";
import { ApprovedRequests as HODApprovedRequests, RejectedRequests as HODRejectedRequests, AllRequests as HODAllRequests, LeaveApprovals as HODLeaveApprovals } from "./pages/hod/approvals";
import StudentLayout from "./pages/student/studentlayout";
import StudentDashboard from "./pages/student/studentdashboard";
import { lazy, Suspense } from "react";
const SchoolsPage = lazy(() => import("./pages/deputy_registrar/schools/index"));
import ProgrammesPage from './pages/deputy_registrar/programmes/index';
import SubjectPage from './pages/deputy_registrar/subjects/SubjectPage';
import SubjectScheme from './pages/deputy_registrar/scheme/SubjectScheme';
import EventTypeSubtypeRegistration from './pages/hod/eventtyperegistration';
import EventRegister from "./pages/faculty/event/EventRegister";
import EventRegisteredList from "./pages/faculty/event/EventRegisteredList";
import { DeputyRegistrarDashboard, DeputyRegistrarSidebar, DeputyRegistrarLayout } from "./pages/deputy_registrar";
import { VcOfficeDashboard, VcOfficeLayout, VCEventsList, VCEventDetail } from './pages/vc-office/index';
import FacultyRegistration from './pages/hr/faculty-registration';
import RequireHR from './components/RequireHR';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            {/* Landing page with Layout (Header & Footer) */}
            <Route path="/" element={<Index />} />
            
            {/* Pages without Layout components */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Deputy Registrar position with its own layout and dashboard */}
            <Route path="/deputy_registrar/*" element={
              <ProtectedRoute allowedUserTypes={["deputy_registrar"]}>
                <DeputyRegistrarLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DeputyRegistrarDashboard />} />
              <Route path="schools" element={<SchoolsPage />} />
              <Route path="programmes" element={<ProgrammesPage />} />
              <Route path="subjects" element={<SubjectPage />} />
              <Route path="scheme/subjects" element={<SubjectScheme />} />
              <Route path="archive" element={<div>Archive Page</div>} />
              <Route path="search" element={<div>Search Page</div>} />
              <Route path="approvals" element={<div>Approvals Page</div>} />
              <Route path="tracking" element={<div>Tracking Page</div>} />
              <Route path="reports" element={<div>Reports Page</div>} />
              <Route path="profile" element={<div>Profile Page</div>} />
              <Route path="settings" element={<div>Settings Page</div>} />
              <Route path="*" element={<NotFound />} />
            </Route>
            
            {/* VC position with its own layout and dashboard */}
            <Route path="/vc/*" element={
              <ProtectedRoute allowedUserTypes={["vc"]}>
                <VCLayout>
                  <Routes>
                  <Route path="dashboard" element={<VCDashboard />} />
                  <Route path="event-approvals" element={<EventApprovals />} />
                  <Route path="profile" element={<div>VC Profile Page</div>} />
                  <Route path="attendance" element={<div>VC Attendance Page</div>} />
                  <Route path="approvals/approved" element={<VCApprovedRequests />} />
                  <Route path="approvals/rejected" element={<VCRejectedRequests />} />
                  <Route path="approvals/all" element={<VCAllRequests />} />
                  <Route path="approvals/leave" element={<VCLeaveApprovals />} />
                  <Route path="leave/approvals" element={<VCLeaveApprovals />} />
                  <Route path="leave/apply" element={<Apply />} />
                  <Route path="leave/apply-form" element={<ApplyForm />} />
                  <Route path="leave/arrival-departure" element={<ArrivalDeparture />} />
                  <Route path="leave/leave-reports" element={<LeaveReports />} />
                  <Route path="leave/duty-reports" element={<DutySlipReports />} />
                  <Route path="administration/executive-committee" element={<div>Executive Committee Page</div>} />
                  <Route path="administration/faculty-performance" element={<div>Faculty Performance Page</div>} />
                  <Route path="administration/staff-performance" element={<div>Staff Performance Page</div>} />
                  <Route path="ceremony/attendance" element={<div>Ceremony Attendance Page</div>} />
                  <Route path="biometric/attendance" element={<div>Biometric Attendance Page</div>} />
                  <Route path="dcs/student-details" element={<div>Student Details Page</div>} />
                  <Route path="dcs/staff-details" element={<div>Staff Details Page</div>} />
                  <Route path="dcs/program-details" element={<div>Program Details Page</div>} />
                  <Route path="dcs/finance-details" element={<div>Finance Details Page</div>} />
                  <Route path="reports/academic" element={<div>Academic Reports Page</div>} />
                  <Route path="reports/financial" element={<div>Financial Reports Page</div>} />
                  <Route path="reports/faculty" element={<div>Faculty Reports Page</div>} />
                  <Route path="strategic/goals" element={<div>University Goals Page</div>} />
                  <Route path="strategic/budget" element={<div>Budget Planning Page</div>} />
                  <Route path="notices/create" element={<div>Create Notice Page</div>} />
                  <Route path="notices/view" element={<div>View Notices Page</div>} />
                  <Route path="notesheet" element={<div>Notesheet Page</div>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </VCLayout>
            </ProtectedRoute>
          } />
          
          {/* Dean position with its own layout and dashboard */}
          <Route path="/dean/*" element={
            <ProtectedRoute allowedUserTypes={["dean"]}>
              <DeanLayout>
                <Routes>
                  <Route path="dashboard" element={<DeanDashboard />} />
                  <Route path="profile" element={<div>Dean Profile Page</div>} />
                  <Route path="approvals/approved" element={<DeanApprovedRequests />} />
                  <Route path="approvals/rejected" element={<DeanRejectedRequests />} />
                  <Route path="approvals/all" element={<DeanAllRequests />} />
                  <Route path="approvals/leave" element={<DeanLeaveApprovals />} />
                  <Route path="leave/approvals" element={<DeanLeaveApprovals />} />
                  <Route path="academics/overview" element={<div>Academic Overview Page</div>} />
                  <Route path="academics/curriculum" element={<div>Curriculum Development Page</div>} />
                  <Route path="academics/programs" element={<div>Academic Programs Page</div>} />
                  <Route path="academics/calendar" element={<div>Academic Calendar Page</div>} />
                  <Route path="faculty/directory" element={<div>Faculty Directory Page</div>} />
                  <Route path="faculty/coordination" element={<div>Faculty Coordination Page</div>} />
                  <Route path="faculty/performance" element={<div>Faculty Performance Page</div>} />
                  <Route path="faculty/development" element={<div>Faculty Development Page</div>} />
                  <Route path="students/services" element={<div>Student Services Page</div>} />
                  <Route path="students/progress" element={<div>Academic Progress Page</div>} />
                  <Route path="students/grievances" element={<div>Student Grievances Page</div>} />
                  <Route path="students/activities" element={<div>Student Activities Page</div>} />
                  <Route path="reports/academic" element={<div>Academic Reports Page</div>} />
                  <Route path="reports/faculty" element={<div>Faculty Reports Page</div>} />
                  <Route path="reports/students" element={<div>Student Analytics Page</div>} />
                  <Route path="reports/programs" element={<div>Program Assessment Page</div>} />
                  <Route path="quality/academic" element={<div>Academic Quality Page</div>} />
                  <Route path="quality/accreditation" element={<div>Accreditation Page</div>} />
                  <Route path="quality/assessment" element={<div>Assessment Tools Page</div>} />
                  <Route path="quality/reports" element={<div>Quality Reports Page</div>} />
                  <Route path="notices/create" element={<div>Create Notice Page</div>} />
                  <Route path="notices/view" element={<div>View Notices Page</div>} />
                  <Route path="notices/templates" element={<div>Notice Templates Page</div>} />
                  <Route path="change-password" element={<div>Change Password Page</div>} />
                  <Route path="account-settings" element={<div>Account Settings Page</div>} />
                  <Route path="security" element={<div>Security & Privacy Page</div>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </DeanLayout>
            </ProtectedRoute>
          } />
          
          {/* Faculty position with its own layout and dashboard */}
          <Route path="/faculty/*" element={
            <ProtectedRoute allowedUserTypes={["faculty"]}>
              <FacultyLayout>
                <Routes>
                  <Route path="dashboard" element={<FacultyDashboard />} />
                  <Route path="profile" element={<FacultyProfile />} />
                  <Route path="leave/apply" element={<Apply />} />
                  <Route path="leave/apply-form" element={<ApplyForm />} />
                  <Route path="leave/arrival-departure" element={<ArrivalDeparture />} />
                  <Route path="leave/leave-reports" element={<LeaveReports />} />
                  <Route path="leave/duty-reports" element={<DutySlipReports />} />
                  <Route path="event/register" element={<EventRegister />} />
                  <Route path="event/registered-list" element={<EventRegisteredList />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </FacultyLayout>
            </ProtectedRoute>
          } />
          
          {/* HR position with its own layout and dashboard */}
          <Route path="/hr/*" element={
            <ProtectedRoute allowedUserTypes={["hr"]}>
              <HRLayout>
                <Routes>
                  <Route path="dashboard" element={<HRDashboard />} />
                  <Route path="profile" element={<div>HR Profile Page</div>} />
                  <Route path="staff/add" element={<AddStaff />} />
                  <Route path="approvals/approved" element={<ApprovedRequests />} />
                  <Route path="approvals/rejected" element={<RejectedRequests />} />
                  <Route path="approvals/all" element={<AllRequests />} />
                  <Route path="approvals/leave" element={<LeaveApprovals />} />
                  <Route path="faculty-registration" element={<RequireHR><FacultyRegistration /></RequireHR>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HRLayout>
            </ProtectedRoute>
          } />
          
          {/* Student position with its own layout and dashboard */}
          <Route path="/student/*" element={
            <ProtectedRoute allowedUserTypes={["student"]}>
              <StudentLayout>
                <Routes>
                  <Route path="dashboard" element={<StudentDashboard />} />
                  <Route path="profile" element={<div>Student Profile Page</div>} />
                  <Route path="courses" element={<div>My Courses Page</div>} />
                  <Route path="class-schedule" element={<div>Class Schedule Page</div>} />
                  <Route path="attendance-report" element={<div>Attendance Report Page</div>} />
                  <Route path="results" element={<div>Exam Results Page</div>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </StudentLayout>
            </ProtectedRoute>
          } />
          
          {/* HOD position with its own layout and dashboard */}
          <Route path="/hod/*" element={
            <ProtectedRoute allowedUserTypes={["hod", "head of department"]}>
              <HODLayout>
                <Routes>
                  <Route path="dashboard" element={<HODDashboard />} />
                  <Route path="event-type-registration" element={<EventTypeSubtypeRegistration />} />
                  <Route path="profile" element={<div>HOD Profile Page</div>} />
                  <Route path="approvals/approved" element={<HODApprovedRequests />} />
                  <Route path="approvals/rejected" element={<HODRejectedRequests />} />
                  <Route path="approvals/all" element={<HODAllRequests />} />
                  <Route path="approvals/leave" element={<HODLeaveApprovals />} />
                  <Route path="leave-approvals" element={<HODLeaveApprovals />} />
                  <Route path="faculty-management" element={<div>Faculty Management Page</div>} />
                  <Route path="course-management" element={<div>Course Management Page</div>} />
                  <Route path="student-records" element={<div>Student Records Page</div>} />
                  <Route path="reports" element={<div>Department Reports Page</div>} />
                  <Route path="calendar" element={<div>Academic Calendar Page</div>} />
                  <Route path="research" element={<div>Research Projects Page</div>} />
                  <Route path="notices" element={<div>Department Notices Page</div>} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </HODLayout>
            </ProtectedRoute>
          } />
          
          {/* VC Office position with its own layout and dashboard */}
            <Route path="/vc_office/*" element={
              <ProtectedRoute allowedUserTypes={["vc_office"]}>
                <VcOfficeLayout>
                  <Routes>
                    <Route path="dashboard" element={<VcOfficeDashboard />} />
                    <Route path="circulars" element={<div>Circulars (Coming Soon)</div>} />
                    <Route path="faculty-reviews" element={<div>Faculty Reviews (Coming Soon)</div>} />
                    <Route path="uploads" element={<div>Uploads (Coming Soon)</div>} />
                    <Route path="leave-processing" element={<div>Leave Processing (Coming Soon)</div>} />
                    <Route path="events" element={<VCEventsList />} />
                    <Route path="events/:id" element={<VCEventDetail />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </VcOfficeLayout>
              </ProtectedRoute>
            } />
          
          {/* Catch-all for 404 page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
          </Suspense>
          <Toaster />
          <Sonner />
      </BrowserRouter>
    </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
