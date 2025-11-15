import api from './axios';

export const uploadsAPI = {
  upload: async (formData) => {
    const response = await api.post('/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  getUploads: async (params) => {
    const response = await api.get('/uploads', { params });
    return response.data;
  },

  getUploadById: async (id) => {
    const response = await api.get(`/uploads/${id}`);
    return response.data;
  },

  deleteUpload: async (id) => {
    const response = await api.delete(`/uploads/${id}`);
    return response.data;
  },

  downloadFile: (id) => {
    return `/api/uploads/${id}/download`;
  }
};
