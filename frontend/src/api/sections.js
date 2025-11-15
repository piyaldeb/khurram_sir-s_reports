import api from './axios';

export const sectionsAPI = {
  getSections: async () => {
    const response = await api.get('/sections');
    return response.data;
  },

  createSection: async (name, subsections) => {
    const response = await api.post('/sections', { name, subsections });
    return response.data;
  },

  updateSection: async (id, name, subsections) => {
    const response = await api.put(`/sections/${id}`, { name, subsections });
    return response.data;
  },

  deleteSection: async (id) => {
    const response = await api.delete(`/sections/${id}`);
    return response.data;
  }
};
