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
};
