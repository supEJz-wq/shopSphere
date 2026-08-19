import api from './api';

export const adminService = {
  async getApplications(status) {
    const response = await api.get('/admin/applications', {
      params: status ? { status } : {},
    });
    return response.data;
  },

  async getApplicationById(id) {
    const response = await api.get(`/admin/applications/${id}`);
    return response.data;
  },

  async reviewApplication(id, { status, note }) {
    const response = await api.patch(`/admin/applications/${id}/review`, {
      status,
      reviewNote: note,
    });
    return response.data;
  },

  async getProducts({ search, category, shop, status, from, to } = {}) {
    const response = await api.get('/admin/products', {
      params: { search: search || undefined, category: category || undefined, shop: shop || undefined, status: status || undefined, from: from || undefined, to: to || undefined },
    });
    return response.data;
  },

  async getSellers({ search, status } = {}) {
    const response = await api.get('/admin/sellers', {
      params: { search: search || undefined, status: status || undefined },
    });
    return response.data;
  },

  async getSellerDetail(id) {
    const response = await api.get(`/admin/sellers/${id}`);
    return response.data;
  },

  async banProduct(id) {
    const response = await api.post(`/admin/products/${id}/ban`);
    return response.data;
  },

  async unbanProduct(id) {
    const response = await api.post(`/admin/products/${id}/unban`);
    return response.data;
  },

  async banSeller(id) {
    const response = await api.post(`/admin/sellers/${id}/ban`);
    return response.data;
  },

  async unbanSeller(id) {
    const response = await api.post(`/admin/sellers/${id}/unban`);
    return response.data;
  },

  async warnSeller(id, message) {
    const response = await api.post(`/admin/sellers/${id}/warn`, { message });
    return response.data;
  },

  async removeWarning(id) {
    const response = await api.delete(`/admin/warnings/${id}`);
    return response.data;
  },

  async getHistory({ search, action } = {}) {
    const response = await api.get('/admin/history', {
      params: { search: search || undefined, action: action || undefined },
    });
    return response.data;
  },

  async getWithdrawals({ status, search } = {}) {
    const response = await api.get('/admin/withdrawals', {
      params: { status: status || undefined, search: search || undefined },
    });
    return response.data;
  },

  async approveWithdrawal(id, { method, adminNote } = {}) {
    const response = await api.post(`/admin/withdrawals/${id}/approve`, { method, adminNote });
    return response.data;
  },

  async rejectWithdrawal(id, { adminNote } = {}) {
    const response = await api.post(`/admin/withdrawals/${id}/reject`, { adminNote });
    return response.data;
  },

  async getAppeals({ status } = {}) {
    const response = await api.get('/admin/appeals', {
      params: { status: status || undefined },
    });
    return response.data;
  },

  async reviewAppeal(id, { decision, adminNote }) {
    const response = await api.post(`/admin/appeals/${id}/review`, {
      decision,
      adminNote,
    });
    return response.data;
  },
};