import adminApi from './adminApi';

const adminService = {
  async login(email, password) {
    const { data } = await adminApi.post('/admin/login', { email, password });
    return data;
  },

  async getCurrentAdmin() {
    const { data } = await adminApi.get('/admin/me');
    return data;
  },

  async getOrders() {
    const { data } = await adminApi.get('/admin/orders');
    return data;
  },

  async updateOrderStatus(orderId, status) {
    const { data } = await adminApi.put(`/admin/orders/${orderId}/status`, { status });
    return data;
  },

  async getPromos() {
    const { data } = await adminApi.get('/admin/promos');
    return data;
  },

  async createPromo(promoData) {
    const { data } = await adminApi.post('/admin/promos', promoData);
    return data;
  },

  async updatePromo(promoId, updates) {
    const { data } = await adminApi.put(`/admin/promos/${promoId}`, updates);
    return data;
  },

  async deletePromo(promoId) {
    const { data } = await adminApi.delete(`/admin/promos/${promoId}`);
    return data;
  },
};

export default adminService;
