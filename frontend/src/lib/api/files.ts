import { apiClient } from "./client";

export const FileAPI = {
  getDashboardFiles: () => apiClient.get("/files"),

  getUploadUrl: (data: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }) => apiClient.post("/files/upload-url", data),

  // New: Confirm the upload with the backend
  confirmUpload: (data: {
    storageKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
  }) => apiClient.post("/files/confirm", data),

  // New: Get a secure download link
  getDownloadUrl: (fileId: string) =>
    apiClient.get(`/files/${fileId}/download`),

  toggleAccess: (fileId: string, isPublic: boolean) =>
    apiClient.patch(`/files/${fileId}/access`, { isPublic }),

  getSharedFile: (fileId: string) => apiClient.get(`/files/share/${fileId}`),
};
