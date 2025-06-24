import axiosInstance from '../lib/axios';

export const COURSE_TYPE = [
  { value: 'SemesterWise', label: 'Semester Wise' },
  { value: 'YearWise', label: 'Year Wise' }
];

export const SYSTEM_TYPE = [
  { value: 'GradingWise', label: 'Grading Wise' },
  { value: 'PercentageWise', label: 'Percentage Wise' }
];

export const EDUCATION_LEVEL = [
  { value: 'UG', label: 'UG' },
  { value: 'PG', label: 'PG' },
  { value: 'Diploma', label: 'Diploma' },
  { value: 'PG_Diploma', label: 'PG Diploma' },
  { value: 'PhD', label: 'PhD' }
];

export const REGULATORY_BODIES = [
  { value: 'AICTE', label: 'AICTE' },
  { value: 'INC', label: 'INC' },
  { value: 'PCI', label: 'PCI' },
  { value: 'ICAR', label: 'ICAR' },
  { value: 'NCT', label: 'NCT' }
];

export const NEP_OPTIONS = [
  { value: 'NEP', label: 'NEP' },
  { value: 'Non-NEP', label: 'Non-NEP' }
];

export const NAAC_OPTIONS = [
  { value: 'NAAC', label: 'NAAC' },
  { value: 'Non-NAAC', label: 'Non-NAAC' }
];

export interface Programme {
  id?: number;
  academic_year: string;
  course: string;
  branch: string;
  semester: string;
  school: number;
  school_details?: {
    id: number;
    name: string;
  };
  type: string;
  system_type: string;
  education_level: string;
  regulatory_bodies: string;
  nep_non_nep: string;
  naac_non_naac: string;
}

export const programmeService = {
  getAllProgrammes: async (filters?: { school?: number }): Promise<Programme[]> => {
    const params = new URLSearchParams();
    if (filters?.school) {
      params.append('school', filters.school.toString());
    }
    const response = await axiosInstance.get(`/api/dr/organizations/programmes/?${params.toString()}`);
    return response.data;
  },

  createProgramme: async (programme: Omit<Programme, 'id'>): Promise<Programme> => {
    const response = await axiosInstance.post('/api/dr/organizations/programmes/', programme);
    return response.data;
  },

  updateProgramme: async (id: number, programme: Partial<Programme>): Promise<Programme> => {
    const response = await axiosInstance.patch(`/api/dr/organizations/programmes/${id}/`, programme);
    return response.data;
  },

  deleteProgramme: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/api/dr/organizations/programmes/${id}/`);
  },

  // Fetch unique courses for a given school
  getCoursesBySchool: async (schoolId: number): Promise<string[]> => {
    const response = await axiosInstance.get(`/api/dr/organizations/programmes/courses-by-school/?school=${schoolId}`);
    return response.data;
  },

  // Fetch unique academic years for a given school and course
  getYearsByCourse: async (schoolId: number, course: string): Promise<string[]> => {
    const response = await axiosInstance.get(`/api/dr/organizations/programmes/years-by-course/?school=${schoolId}&course=${encodeURIComponent(course)}`);
    return response.data;
  },
};