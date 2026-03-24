import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api, { API_BASE } from '../utils/api';

const Signup = () => {
  const { login } = useAuth();
  const { t, lang, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '', email: '', password: '', rollNumber: '',
    hostelName: '', roomNumber: '', idNumber: '', workerId: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form, role };
      const res = await api.post('/auth/signup', payload);
      login(res.data.user, res.data.token);
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError(`Cannot connect to server at ${API_BASE}. Make sure backend is running.`);
      } else {
        setError(err.response?.data?.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) => setForm({ ...form, [field]: value });

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>🏠 HMS</h1>
          <h2>{t('signup')}</h2>
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
          <div className="form-group">
            <label>{t('name')}</label>
            <input type="text" value={form.name} onChange={e => updateForm('name', e.target.value)} required />
          </div>

          {role !== 'worker' && (
            <div className="form-group">
              <label>{t('email')}</label>
              <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} required />
            </div>
          )}

          <div className="form-group">
            <label>{t('password')}</label>
            <input type="password" value={form.password} onChange={e => updateForm('password', e.target.value)} required minLength={6} />
          </div>

          {role === 'student' && (
            <>
              <div className="form-group">
                <label>{t('rollNumber')}</label>
                <input type="text" value={form.rollNumber} onChange={e => updateForm('rollNumber', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>{t('hostelName')}</label>
                <input type="text" value={form.hostelName} onChange={e => updateForm('hostelName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>{t('roomNumber')}</label>
                <input type="text" value={form.roomNumber} onChange={e => updateForm('roomNumber', e.target.value)} required />
              </div>
            </>
          )}

          {role === 'admin' && (
            <div className="form-group">
              <label>{t('idNumber')}</label>
              <input type="text" value={form.idNumber} onChange={e => updateForm('idNumber', e.target.value)} required />
            </div>
          )}

          {role === 'worker' && (
            <div className="form-group">
              <label>{t('workerId')}</label>
              <input type="text" value={form.workerId} onChange={e => updateForm('workerId', e.target.value)} required />
            </div>
          )}

          <button type="submit" className="btn-primary btn-large" disabled={loading}>
            {loading ? t('loading') : t('signup')}
          </button>
        </form>

        <p className="api-debug">API: {API_BASE}</p>

        <p className="auth-link">
          {t('haveAccount')} <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;