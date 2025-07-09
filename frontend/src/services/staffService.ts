import axios from 'axios';
import { axiosInstance } from './authService';

export interface StaffListItem {
  id: number;
  full_name: string;
  email: string;
  employee_type: string;
  school: string;
  department: string;
}

const API_URL = 'http://localhost:8000/api/auth/hr/faculty-list';
const API_DETAIL_URL = 'http://localhost:8000/api/auth/hr/faculty-detail';

const staffService = {
  getAllStaff: async (): Promise<StaffListItem[]> => {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },
  getStaffDetails: async (id: number) => {
    const response = await axiosInstance.get(`${API_DETAIL_URL}/${id}/`);
    return response.data;
  },
  getFacultyDocuments: async (id: number) => {
    const response = await axiosInstance.get(`http://localhost:8000/api/auth/hr/faculty-documents/${id}/`);
    return response.data;
  },
  getFacultyDocumentsFallback: async (id: number) => {
    const response = await axiosInstance.get(`http://localhost:8000/api/auth/faculty/${id}/documents`);
    return response.data;
  },
  approveStaff: async (id: number) => {
    // PATCH request to set is_staff to true
    const response = await axiosInstance.patch(`${API_DETAIL_URL}/${id}/`, { is_staff: true });
    return response.data;
  },
};

export default staffService; 