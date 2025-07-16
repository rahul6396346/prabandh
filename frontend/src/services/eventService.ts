import axios from '@/lib/axios';

export interface EventDetailsForm {
  [key: string]: any;
}

export const eventService = {
  registerEvent: async (data: EventDetailsForm) => {
    return axios.post('/api/facultyservices/events/', data);
  },
  getMyEvents: async () => {
    return axios.get('/api/facultyservices/events/list/');
  },
  uploadFile: async (eventId: number, fileType: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    return axios.post(`/api/facultyservices/events/${eventId}/upload-file/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};
