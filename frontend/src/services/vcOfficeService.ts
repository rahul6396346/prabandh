import axios from "axios";

const API_BASE = "/api/facultyservices/vc-office";

export const loginVcOffice = async (email: string, password: string) => {
  const response = await axios.post("/api/auth/login/", {
    primary_email: email,
    password,
    emptype: "VC Office",
  });
  return response.data;
};

export const getDashboardSummary = async (token: string) => {
  const response = await axios.get(`${API_BASE}/dashboard/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getVcOfficeDashboard = async (token: string) => {
  const res = await axios.get("/api/facultyservices/vc-office/dashboard/", {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}; 