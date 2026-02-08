import api from './api';

const orderService = {
  async getOrders() {
    const { data } = await api.get('/orders');
    return data;
  },

  async getOrderById(id) {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  async createOrder(orderData) {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  async createCheckoutSession(checkoutData) {
    const { data } = await api.post('/stripe/create-checkout-session', checkoutData);
    return data;
  },
};

export default orderService;
