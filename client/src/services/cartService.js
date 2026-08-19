import api from './api';

export const cartService = {
  async getCart() {
    const response = await api.get('/cart');
    return response.data;
  },

  async addToCart(productId, quantity) {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  async updateCartItem(cartItemId, quantity) {
    const response = await api.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  async removeCartItem(cartItemId) {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  },
};
