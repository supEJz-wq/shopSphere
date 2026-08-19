import api from './api';

export const storeService = {
  async getStore(storeId) {
    const response = await api.get(`/stores/${storeId}`);
    return response.data;
  },
};

export const productReviewService = {
  async getReviews(productId) {
    const response = await api.get(`/products/${productId}/reviews`);
    return response.data;
  },

  async getMyReview(productId) {
    const response = await api.get(`/products/${productId}/reviews/me`);
    return response.data;
  },

  async submitReview(productId, data) {
    const response = await api.post(`/products/${productId}/reviews`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteReview(productId) {
    const response = await api.delete(`/products/${productId}/reviews`);
    return response.data;
  },
};