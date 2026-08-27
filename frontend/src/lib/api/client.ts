import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Automatically attach the JWT token to every request
// apiClient.interceptors.request.use((config) => {
//   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// Intercept responses to globally handle expired sessions (401 Unauthorized)
apiClient.interceptors.response.use(
  (response) => {
    // If the request succeeds, just return the response
    return response;
  },
  (error) => {
    // If the server rejects the cookie (expired or invalid)
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Redirect to login to get a fresh session
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);