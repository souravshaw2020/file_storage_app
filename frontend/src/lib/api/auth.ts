import { apiClient } from "./client";

export const AuthAPI = {
  // POST /auth/register - Create a new user resource
  register: (data: { email: string; password: string }) =>
    apiClient.post("/auth/register", data),

  // POST /auth/login - Authenticate and retrieve a token
  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login'; // Force a hard redirect to clear client state
    }
  }
};
