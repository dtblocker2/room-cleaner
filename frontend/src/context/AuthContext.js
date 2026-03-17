import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    const t = token || localStorage.getItem('token');
    if (t) headers['Authorization'] = `Bearer ${t}`;
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (res.status === 401) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    }
    return { ok: res.ok, data };
  }, [token]);

  useEffect(() => {
    if (token) {
      apiFetch('/api/auth/me')
        .then(({ ok, data }) => {
          if (ok) setUser(data.user);
          else { localStorage.removeItem('token'); setToken(null); }
        })
        .catch(() => { localStorage.removeItem('token'); setToken(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line

  const login = async (email, password) => {
    const { ok, data } = await apiFetch('/api/auth/login', {
      method: 'POST', body: JSON.stringify({ email, password })
    });
    if (ok) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return { ok, message: data.message };
  };

  const register = async (formData) => {
    const { ok, data } = await apiFetch('/api/auth/register', {
      method: 'POST', body: JSON.stringify(formData)
    });
    if (ok) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
    }
    return { ok, message: data.message };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (u) => setUser(u);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, apiFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);