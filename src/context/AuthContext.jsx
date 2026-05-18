import { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setSession = (token, user) => {
    if (token) localStorage.setItem('ds_token', token);
    if (user) localStorage.setItem('ds_user', JSON.stringify(user));
    setUser(user);
  };

  useEffect(() => {
    const token = localStorage.getItem('ds_token');
    const stored = localStorage.getItem('ds_user');
    if (!token) {
      setLoading(false);
      return;
    }
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        // ignore
      }
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('ds_token');
        localStorage.removeItem('ds_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setSession(data.token, data.user);
    toast.success(`Welcome back, ${data.user.name.split(' ')[0]}!`);
    return data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setSession(data.token, data.user);
    toast.success(`Welcome to DS Store, ${data.user.name.split(' ')[0]}!`);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('ds_token');
    localStorage.removeItem('ds_user');
    setUser(null);
    toast.success('Logged out');
  };

  const updateProfile = async (payload) => {
    const { data } = await api.put('/users/profile', payload);
    setSession(null, data.user);
    toast.success('Profile updated');
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
