import api from './axios';

export const reportsAPI = {
  getReportKeys: async () => {
    const response = await api.get('/reports/keys');
    return response.data;
  },

  getReport: async (reportKey) => {
    const response = await api.get(`/reports/${reportKey}`);
    return response.data;
  },

  refreshReports: async (reportKey = null) => {
    const response = await api.post('/reports/refresh', { reportKey });
    return response.data;
  }
};
