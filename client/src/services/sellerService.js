import api from './api';

export const sellerService = {
  async apply(data) {
    const response = await api.post('/seller/apply', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getMyApplication() {
    const response = await api.get('/seller/application');
    return response.data;
  },

  async getDashboard() {
    const response = await api.get('/seller/dashboard');
    return response.data;
  },

  async getProducts() {
    const response = await api.get('/seller/products');
    return response.data;
  },

  async createProduct(data, imageFiles = []) {
    let payload = data;
    let headers = {};
    if (imageFiles.length > 0) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      imageFiles.forEach((file) => formData.append('images', file));
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.post('/seller/products', payload, { headers });
    return response.data;
  },

  async updateProduct(productId, data, imageFiles = []) {
    let payload = data;
    let headers = {};
    if (imageFiles.length > 0) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => formData.append(key, value));
      imageFiles.forEach((file) => formData.append('images', file));
      payload = formData;
      headers = { 'Content-Type': 'multipart/form-data' };
    }
    const response = await api.patch(`/seller/products/${productId}`, payload, { headers });
    return response.data;
  },

  async deleteProduct(productId) {
    const response = await api.delete(`/seller/products/${productId}`);
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/seller/orders');
    return response.data;
  },

  async getWallet() {
    const response = await api.get('/seller/wallet');
    return response.data;
  },

  async createWithdrawal(amount, method) {
    const response = await api.post('/seller/wallet/withdraw', { amount, method });
    return response.data;
  },

  async updateOrderItemStatus(orderItemId, status) {
    const response = await api.patch(`/seller/orders/${orderItemId}/status`, { status });
    return response.data;
  },

  async createAppeal(targetType, productId, reason, imageFile) {
    const formData = new FormData();
    formData.append('targetType', targetType);
    if (productId) formData.append('productId', productId);
    formData.append('reason', reason);
    if (imageFile) formData.append('proofImage', imageFile);
    const response = await api.post('/seller/appeals', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async replyToWarning(warningId, message, imageFile) {
    const formData = new FormData();
    formData.append('message', message);
    if (imageFile) formData.append('proofImage', imageFile);
    const response = await api.post(`/seller/warnings/${warningId}/reply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};