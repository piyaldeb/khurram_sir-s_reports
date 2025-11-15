import api from './axios';

export const sheetConfigAPI = {
  getConfigs: async () => {
    const response = await api.get('/sheet-config');
    return response.data;
  },

  getConfigByKey: async (reportKey) => {
    const response = await api.get(`/sheet-config/${reportKey}`);
    return response.data;
  },

  createConfig: async (data) => {
    const response = await api.post('/sheet-config', data);
    return response.data;
  },

  updateConfig: async (id, data) => {
    const response = await api.put(`/sheet-config/${id}`, data);
    return response.data;
  },

  deleteConfig: async (id) => {
    const response = await api.delete(`/sheet-config/${id}`);
    return response.data;
  },

  testConfig: async (id) => {
    const response = await api.post(`/sheet-config/${id}/test`);
    return response.data;
  }
};
