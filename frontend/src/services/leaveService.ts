import axios from 'axios';
import authService from './authService'; // Import authService

// Make sure the API URL points to where the backend is running
const API_URL = 'http://localhost:8000/api/faculty/leave/';

// Create axios instance with auth token
const axiosInstance = axios.create();

// Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    const token = localStorage.getItem('token');
    
    console.log("🔐 Auth tokens available:", {
      hasAccessToken: !!accessToken,
      hasToken: !!token,
      url: config.url
    });
    
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      console.log("🔑 Using Bearer token for authentication");
    } else if (token) {
      config.headers['Authorization'] = `Token ${token}`;
      console.log("🔑 Using Token authentication");
    } else {
      console.warn("⚠️ No authentication token found in localStorage");
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

export interface LeaveApplication {
  id: number;
  faculty: number;
  faculty_details: any;
  leave_type: string;
  from_date: string;
  to_date: string;
  no_of_days: number;
  reason: string;
  contact_during_leave: string;
  address_during_leave?: string;
  forward_to: string;
  supporting_document?: string;
  status: string;
  applied_on: string;
  updated_on: string;
  remarks?: string;
  class_adjustments?: any[];
}

const leaveService = {
  // Get all leave applications
  getAllLeaves: async (): Promise<LeaveApplication[]> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      // Handle case where user is not logged in
      console.log('getAllLeaves: No current user found');
      return [];
    }
    console.log('Fetching all leaves for faculty ID:', currentUser.id);
    try {
      // Try both parameter conventions that might be used by the backend
      const response = await axiosInstance.get(`${API_URL}applications/?faculty_id=${currentUser.id}`);
      console.log('getAllLeaves response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in getAllLeaves:', error);
      return [];
    }
  },

  // Get leave applications by status
  getLeavesByStatus: async (status: string): Promise<LeaveApplication[]> => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      // Handle case where user is not logged in
      console.log('getLeavesByStatus: No current user found');
      return [];
    }
    console.log(`Fetching ${status} leaves for faculty ID:`, currentUser.id);
    try {
      // Use a set of statuses that map to the requested status
      let statusQuery = status;
      
      // Map HR-specific statuses to main status categories
      if (status === 'approved') {
        statusQuery = 'approved,approved_by_hr';
      } else if (status === 'rejected') {
        statusQuery = 'rejected,rejected_by_hr';
      } else if (status === 'pending') {
        statusQuery = 'pending,forwarded_to_hr';
      }
      
      // Try both parameter conventions that might be used by the backend
      const response = await axiosInstance.get(`${API_URL}applications/?status=${statusQuery}&faculty_id=${currentUser.id}`);
      console.log(`getLeavesByStatus(${status}) response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in getLeavesByStatus(${status}):`, error);
      return [];
    }
  },

  // Get pending leave applications
  getPendingLeaves: async (): Promise<LeaveApplication[]> => {
    return leaveService.getLeavesByStatus('pending');
  },

  // Get approved leave applications
  getApprovedLeaves: async (): Promise<LeaveApplication[]> => {
    return leaveService.getLeavesByStatus('approved');
  },

  // Get rejected leave applications
  getRejectedLeaves: async (): Promise<LeaveApplication[]> => {
    return leaveService.getLeavesByStatus('rejected');
  },

  // Get leave balance
  getLeaveBalance: async () => {
    try {
      console.log("🔄 Calling leave balance API...");
      const response = await axiosInstance.get(`${API_URL}applications/leave_balance/`);
      console.log("✅ Leave balance API response:", {
        status: response.status,
        data: response.data,
        headers: response.headers
      });
      
      // Validate response structure
      if (!response.data || typeof response.data !== 'object') {
        throw new Error("Invalid API response format");
      }
      
      return response.data;
    } catch (error: any) {
      console.error("❌ Leave balance API error:", {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: `${API_URL}applications/leave_balance/`
      });
      
      // Check for specific error types
      if (error.response?.status === 401) {
        console.warn("🔐 Authentication error - token may be expired");
        // You might want to redirect to login or refresh token here
      } else if (error.response?.status === 403) {
        console.warn("🚫 Authorization error - insufficient permissions");
      } else if (error.response?.status === 500) {
        console.warn("🔥 Server error - backend issue");
      }
      
      // Return fallback data structure that matches the expected format
      const fallbackData = {
        earned: { total: 0, used: 0, remaining: 0 },
        medical: { total: 0, used: 0, remaining: 0 },
        compensatory: { total: 0, used: 0, remaining: 0 },
        casual: { total: 0, used: 0, remaining: 0 },
        semester: { total: 0, used: 0, remaining: 0 },
        maternity: { total: 0, used: 0, remaining: 0 },
        paternity: { total: 0, used: 0, remaining: 0 },
        duty: { total: 0, used: 0, remaining: 0 },
        extraordinary: { total: 0, used: 0, remaining: 0 },
        academic: { total: 0, used: 0, remaining: 0 },
        half_pay: { total: 0, used: 0, remaining: 0 }
      };
      
      console.log("📤 Returning fallback leave balance data");
      throw error; // Re-throw to let the component handle the error
    }
  },

  // Create a new leave application
  createLeave: async (leaveData: any): Promise<LeaveApplication> => {
    try {
      const response = await axiosInstance.post(`${API_URL}applications/`, leaveData);
      console.log('createLeave response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in createLeave:', error);
      throw error;
    }
  },

  // Get a specific leave application
  getLeave: async (id: number): Promise<LeaveApplication> => {
    try {
      const response = await axiosInstance.get(`${API_URL}applications/${id}/`);
      console.log(`getLeave(${id}) response:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error in getLeave(${id}):`, error);
      throw error;
    }
  },

  // Update a leave application
  updateLeave: async (id: number, leaveData: any): Promise<LeaveApplication> => {
    const response = await axiosInstance.put(`${API_URL}applications/${id}/`, leaveData);
    return response.data;
  },

  // Delete a leave application
  deleteLeave: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${API_URL}applications/${id}/`);
  },

  // Forward a leave application to HR
  forwardToHR: async (id: number): Promise<any> => {
    const response = await axiosInstance.post(`${API_URL}applications/${id}/forward_to_hr/`);
    return response.data;
  },

  // HR approve a leave application
  hrApprove: async (id: number, remarks?: string): Promise<any> => {
    const response = await axiosInstance.post(`${API_URL}applications/${id}/hr_approve/`, { remarks });
    return response.data;
  },

  // HR reject a leave application
  hrReject: async (id: number, remarks?: string): Promise<any> => {
    const response = await axiosInstance.post(`${API_URL}applications/${id}/hr_reject/`, { remarks });
    return response.data;
  }
};

export default leaveService;