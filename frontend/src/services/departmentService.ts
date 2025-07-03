import { axiosInstance } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Department {
  id: number;
  name: string;
  school: number;
  school_name?: string;
}

export const departmentService = {
  getAllDepartments: async (): Promise<Department[]> => {
    const response = await axiosInstance.get(`${API_URL}/api/dr/organizations/departments/`);
    return response.data;
  },

  createDepartment: async (departmentData: Omit<Department, 'id'|'school_name'>): Promise<Department> => {
    const response = await axiosInstance.post(`${API_URL}/api/dr/organizations/departments/`, departmentData);
    return response.data;
  },

  updateDepartment: async (id: number, departmentData: Omit<Department, 'id'|'school_name'>): Promise<Department> => {
    const response = await axiosInstance.put(`${API_URL}/api/dr/organizations/departments/${id}/`, departmentData);
    return response.data;
  },

  deleteDepartment: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${API_URL}/api/dr/organizations/departments/${id}/`);
  },
}; 