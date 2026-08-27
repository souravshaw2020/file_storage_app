import { apiClient } from "./client";

export const AuthAPI = {
  // POST /auth/register - Create a new user resource
  register: (data: { email: string; password: string }) =>
    apiClient.post("/auth/register", data),

  // POST /auth/login - Authenticate and retrieve a token
  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),

  // Updated to hit the backend endpoint
  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  },
};
