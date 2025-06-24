import { axiosInstance } from './authService'; // <-- Use your configured instance

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface School {
  id?: number;
  name: string;
}

export const schoolService = {
  getAllSchools: async (): Promise<School[]> => {
    const response = await axiosInstance.get(`${API_URL}/api/dr/organizations/schools/`);
    return response.data;
  },

  createSchool: async (schoolData: School): Promise<School> => {
    const response = await axiosInstance.post(`${API_URL}/api/dr/organizations/schools/`, schoolData);
    return response.data;
  },

  updateSchool: async (id: number, schoolData: School): Promise<School> => {
    const response = await axiosInstance.put(`${API_URL}/api/dr/organizations/schools/${id}/`, schoolData);
    return response.data;
  },

  deleteSchool: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${API_URL}/api/dr/organizations/schools/${id}/`);
  },
};