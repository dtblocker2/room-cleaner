import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api, { API_BASE } from '../utils/api';

const Login = () => {
  const { login } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({ email: '', password: '', workerId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      const res = await api.post('/auth/login', payload);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError(`Cannot connect to server at ${API_BASE}. Make sure backend is running.`);
      } else {
        setError(err.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🏠 HMS</h1>
          <h2>{t('login')}</h2>
          <div className="lang-toggle-auth" onClick={toggleLanguage}>
            {lang === 'en' ? 'ਪੰਜਾਬੀ' : 'English'}
          </div>
        </div>

        <div className="role-selector">
          {['student', 'admin', 'worker'].map(r => (
            <button
              key={r}
              className={`role-btn ${role === r ? 'active' : ''}`}
              onClick={() => setRole(r)}
              type="button"
            >
              {r === 'student' ? '🎓' : r === 'admin' ? '👔' : '🔧'} {t(r)}
            </button>
          ))}
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          {role === 'worker' ? (
            <div className="form-group">
              <label>{t('workerId')}</label>
              <input
                type="text"
                value={form.workerId}
                onChange={e => setForm({ ...form, workerId: e.target.value })}
                required
                autoComplete="username"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>{t('email')}</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
          )}

          <div className="form-group">
            <label>{t('password')}</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-primary btn-large" disabled={loading}>
            {loading ? t('loading') : t('login')}
          </button>
        </form>

        {/* Show the API URL being used (helpful for debugging) */}
        <p className="api-debug">API: {API_BASE}</p>

        <p className="auth-link">
          {t('noAccount')} <Link to="/signup">{t('signup')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;