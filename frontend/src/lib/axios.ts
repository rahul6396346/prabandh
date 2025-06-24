import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor
axiosInstance.interceptors.request.use(config => {
  // Only add CSRF token for unsafe methods
  const unsafeMethods = ['post', 'put', 'patch', 'delete'];
  if (unsafeMethods.includes((config.method || '').toLowerCase())) {
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
  }
  return config;
});

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Get the error message
    const message = error.response?.data?.detail || 
                   error.response?.data?.message || 
                   error.message || 
                   'An error occurred';

    // Create an error with the message
    const enhancedError = new Error(message);
    
    // Add response status and data for more context if needed
    if (error.response) {
      enhancedError['status'] = error.response.status;
      enhancedError['data'] = error.response.data;
    }

    return Promise.reject(enhancedError);
  }
);

export default axiosInstance;