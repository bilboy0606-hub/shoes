import api from './api';

const productService = {
  async getProducts(filters = {}) {
    const params = {};
    if (filters.category && filters.category !== 'all') {
      params.category = filters.category;
    }
    if (filters.brand) {
      params.brand = filters.brand;
    }
    const { data } = await api.get('/products', { params });
    return data;
  },

  async getProductById(id) {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async getCategories() {
    const { data } = await api.get('/products/categories');
    return data;
  },

  async getBrands() {
    const { data } = await api.get('/products/brands');
    return data;
  },
};

export default productService;
