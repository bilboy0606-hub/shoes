import api from './api';

const cartService = {
  async getCart() {
    const { data } = await api.get('/cart');
    return data.cart;
  },

  async addItem(productId, size, quantity = 1) {
    const { data } = await api.post('/cart', {
      product_id: productId,
      size,
      quantity,
    });
    return data.cart;
  },

  async updateItem(productId, size, quantity) {
    const { data } = await api.put('/cart', {
      product_id: productId,
      size,
      quantity,
    });
    return data.cart;
  },

  async removeItem(productId, size) {
    const { data } = await api.delete('/cart', {
      data: { product_id: productId, size },
    });
    return data.cart;
  },

  async clearCart() {
    const { data } = await api.delete('/cart/clear');
    return data.cart;
  },

  async syncCart(items) {
    const { data } = await api.post('/cart/sync', { items });
    return data.cart;
  },
};

export default cartService;
