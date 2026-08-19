import api from './api';

export const reportService = {
  async createReport({ targetType, targetId, reason }) {
    const response = await api.post('/reports', { targetType, targetId, reason });
    return response.data;
  },
};

export const adminReportService = {
  async getReports(status) {
    const response = await api.get('/admin/reports', { params: status ? { status } : {} });
    return response.data;
  },

  async resolveReport(reportId) {
    const response = await api.post(`/admin/reports/${reportId}/resolve`);
    return response.data;
  },

  async dismissReport(reportId) {
    const response = await api.post(`/admin/reports/${reportId}/dismiss`);
    return response.data;
  },
};