import axios from 'axios';
import AuthInterceptor from './authInterceptor';

const API_URL = 'http://localhost:8000/api/auth/';

// Create and export a single axiosInstance without baseURL
export const axiosInstance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});


// Retrieve CSRF token from cookie
const getCSRFToken = () => {
  const name = 'csrftoken=';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const c = cookie.trim();
    if (c.startsWith(name)) {
      return decodeURIComponent(c.substring(name.length));
    }
  }
  return null;
};

export interface LoginRequest {
  primary_email: string;
  password: string;
  emptype: string;
}

export interface RegisterRequest {
  registration_no: string;
  name: string;
  primary_email: string;
  password: string;
  emptype: string;
  department?: string;
  designation?: string;
  gender?: string;
  father_name?: string;
  contact_no?: string;
  address?: string;
  qualification?: string;
  experience?: string;
  joining_date?: string;
}

export interface Faculty {
  id: number;
  registration_no: string;
  name: string;
  primary_email: string;
  official_email?: string;
  department?: string;
  designation?: string;
  emptype?: string;
  father_name?: string;
  gender?: string;
  contact_no?: string;
  address?: string;
  qualification?: string;
  experience?: string;
  joining_date?: string;
}

export interface AuthResponse {
  token: string;
  access: string;
  refresh: string;
  user: Faculty;
  message: string;
}

export interface EmptypesResponse {
  emptypes: string[];
  users_by_emptype: {
    [key: string]: UserByEmptype[];
  };
}

export interface UserByEmptype {
  id: number;
  name: string;
  registration_no: string;
  department: string;
}

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-CSRFToken'] = getCSRFToken() || '';

const fetchCSRFToken = async () => {
  try {
    await axios.get(`${API_URL}csrf/`);
    const token = getCSRFToken();
    if (token) {
      axios.defaults.headers.common['X-CSRFToken'] = token;
      axiosInstance.defaults.headers.common['X-CSRFToken'] = token;
    }
  } catch (err) {
    console.error('Error fetching CSRF token:', err);
  }
};

fetchCSRFToken();

// Setup auth interceptor for automatic token refresh
const authInterceptor = AuthInterceptor.getInstance();
authInterceptor.setupInterceptors(axiosInstance);

const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    await fetchCSRFToken();
    const response = await axios.post(`${API_URL}register/`, data, {
      headers: { 'X-CSRFToken': getCSRFToken() || '' }
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refreshToken', response.data.refresh);
    }

    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('userId', response.data.user.registration_no);
    localStorage.setItem('userType', data.emptype);
    localStorage.setItem('isLoggedIn', 'true');
    
    // Store department information
    if (data.department) {
      localStorage.setItem('userDepartment', data.department);
    }

    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    await fetchCSRFToken();
    const response = await axios.post(`${API_URL}login/`, data, {
      headers: { 'X-CSRFToken': getCSRFToken() || '' }
    });

    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refreshToken', response.data.refresh);
    }

    localStorage.setItem('user', JSON.stringify(response.data.user));
    localStorage.setItem('userId', response.data.user.registration_no);
    localStorage.setItem('userType', data.emptype); // Store the actual emptype that was used to login
    localStorage.setItem('isLoggedIn', 'true');
    
    // Store department information if available in the user object
    if (response.data.user.department) {
      localStorage.setItem('userDepartment', response.data.user.department);
    }

    return response.data;
  },

  refreshToken: async (): Promise<{ access: string }> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');
    const response = await axios.post(`${API_URL}token/refresh/`, { refresh: refreshToken });
    if (response.data.access) {
      localStorage.setItem('accessToken', response.data.access);
    }
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post(`${API_URL}logout/`);
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('userType');
      localStorage.removeItem('userId');
      localStorage.removeItem('isLoggedIn');
      await fetchCSRFToken();
    }
  },

  getCurrentUser: (): Faculty | null => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: async (): Promise<boolean> => {
    try {
      // First check if we have tokens in localStorage
      const accessToken = localStorage.getItem('accessToken');
      const token = localStorage.getItem('token');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (!isLoggedIn || (!accessToken && !token)) {
        return false;
      }
      
      // Validate token with backend
      const response = await axiosInstance.get(`${API_URL}check-auth/`);
      return response.data.isAuthenticated;
    } catch (error) {
      console.log('Token validation failed:', error);
      // If token validation fails, try to refresh
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          await authService.refreshToken();
          // Try validation again after refresh
          const response = await axiosInstance.get(`${API_URL}check-auth/`);
          return response.data.isAuthenticated;
        }
      } catch (refreshError) {
        console.log('Token refresh failed during validation');
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('isLoggedIn');
      }
      return false;
    }
  },

  // New method to validate and refresh token if needed
  validateAndRefreshAuth: async (): Promise<boolean> => {
    try {
      const isValid = await authService.isAuthenticated();
      if (isValid) {
        // Update user info if valid
        try {
          const userInfo = await authService.getUserInfo();
          localStorage.setItem('user', JSON.stringify(userInfo));
        } catch (err) {
          console.log('Failed to update user info:', err);
        }
      }
      return isValid;
    } catch (error) {
      console.log('Auth validation failed:', error);
      return false;
    }
  },

  getUserInfo: async (): Promise<Faculty> => {
    const response = await axiosInstance.get(`${API_URL}user/`);
    return response.data;
  },

  getUsersByEmptype: async (emptypes: string[]): Promise<Faculty[]> => {
    try {
      const params = new URLSearchParams();
      emptypes.forEach(type => params.append('emptype', type));
      
      // Make the API call to get users by emptype
      const response = await axiosInstance.get(`${API_URL}users/`, { params });
      console.log('Fetched users by emptype:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by emptype:', error);
      return [];
    }
  },

  getAllEmptypes: async (): Promise<EmptypesResponse> => {
    try {
      // Make the API call to get all emptypes and their users
      const response = await axiosInstance.get(`${API_URL}emptypes/`);
      console.log('Fetched all emptypes:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching emptypes:', error);
      return { emptypes: [], users_by_emptype: {} };
    }
  }
};

export default authService;
