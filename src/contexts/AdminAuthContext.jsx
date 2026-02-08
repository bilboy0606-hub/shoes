import { createContext, useContext, useState, useEffect } from 'react';
import adminService from '../services/adminService';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [loading, setLoading] = useState(true);

  const isAdminAuthenticated = !!admin && !!token;

  useEffect(() => {
    if (token) {
      adminService.getCurrentAdmin()
        .then((data) => setAdmin(data.user))
        .catch(() => {
          localStorage.removeItem('admin_token');
          setToken(null);
          setAdmin(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await adminService.login(email, password);
    localStorage.setItem('admin_token', data.token);
    setToken(data.token);
    setAdmin(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ admin, token, isAdminAuthenticated, loading, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

export default AdminAuthContext;
