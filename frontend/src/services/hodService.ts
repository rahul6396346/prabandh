import axios from 'axios';

const API_BASE = '/api/hod';

export const getHodSummary = async (token: string) => {
  const response = await axios.get(`${API_BASE}/summary/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export default {
  getHodSummary,
}; 