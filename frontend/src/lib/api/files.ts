import { apiClient } from './client';

// Representing the File resource
export const FileAPI = {
  // GET /files - Retrieve collection
  getDashboardFiles: () => apiClient.get('/files'),
  
  // POST /files/upload-url - Create a new upload session
  getUploadUrl: (data: { fileName: string; mimeType: string; sizeBytes: number }) => 
    apiClient.post('/files/upload-url', data),
    
  // PATCH /files/:id/access - Partially update a resource (toggle visibility)
  toggleAccess: (fileId: string, isPublic: boolean) => 
    apiClient.patch(`/files/${fileId}/access`, { isPublic }),
};