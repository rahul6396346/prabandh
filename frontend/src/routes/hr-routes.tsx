import { RouteObject } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { HRLayout, HRDashboard } from "@/pages/hr";
import { 
  ApprovedRequests,
  RejectedRequests,
  AllRequests 
} from "@/pages/hr/approvals";
import ViewStaffPage from '@/pages/hr/staff/view';
import StaffDetailsPage from '@/pages/hr/staff/details';

// HR Routes Configuration
const hrRoutes: RouteObject[] = [
  {
    path: "/hr",
    element: <HRLayout><Outlet /></HRLayout>,
    children: [
      {
        index: true,
        element: <HRDashboard />,
      },
      {
        path: "dashboard",
        element: <HRDashboard />,
      },
      {
        path: "approvals/approved",
        element: <ApprovedRequests />,
      },
      {
        path: "approvals/rejected",
        element: <RejectedRequests />,
      },
      {
        path: "approvals/all",
        element: <AllRequests />,
      },
      {
        path: "staff/view",
        element: <ViewStaffPage />,
      },
      {
        path: "staff/view/:id",
        element: <StaffDetailsPage />,
      },
    ],
  },
];

export default hrRoutes;