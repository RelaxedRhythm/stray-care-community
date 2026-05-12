import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../api.js';

const AuthContext = createContext(null);

const STORAGE_KEY = 'straycare_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [loading, setLoading] = useState(!!localStorage.getItem(STORAGE_KEY));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      setAuthToken(null);
      return;
    }
    setAuthToken(token);
    api
      .get('/auth/me')
      .then((r) => setUser(r.data))
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    localStorage.setItem(STORAGE_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };

  const refreshUser = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data);
    return data;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      refreshUser,
      isAdmin: user?.role === 'admin',
      isVolunteer: user?.role === 'volunteer' && user?.volunteerStatus === 'approved',
      volunteerPending: user?.role === 'volunteer' && user?.volunteerStatus === 'pending',
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
