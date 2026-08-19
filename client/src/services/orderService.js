import api from './api';

export const orderService = {
  async checkout(shippingAddress) {
    const response = await api.post('/orders/checkout', { shippingAddress });
    return response.data;
  },

  async getOrders() {
    const response = await api.get('/orders');
    return response.data;
  },

  async getOrderById(orderId) {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
};