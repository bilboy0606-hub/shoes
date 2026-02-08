import api from './api';

const authService = {
  async register(name, email, password) {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  },

  async login(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  async getCurrentUser() {
    const { data } = await api.get('/auth/me');
    return data;
  },

  async updateProfile(profileData) {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
  },

  async updatePassword(currentPassword, newPassword) {
    const { data } = await api.put('/auth/password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return data;
  },
};

export default authService;
