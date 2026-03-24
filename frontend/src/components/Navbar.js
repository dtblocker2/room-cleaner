import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { lang, t, toggleLanguage } = useLanguage();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnread();
      const interval = setInterval(fetchUnread, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnread = () => {
    api.get('/notifications/unread-count')
      .then(res => setUnread(res.data.count))
      .catch(() => {}); // silently fail
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/dashboard">🏠 HMS</Link>
      </div>

      <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <Link to="/dashboard" onClick={() => setMenuOpen(false)}>{t('dashboard')}</Link>

        {user.role === 'admin' && (
          <Link to="/admin" onClick={() => setMenuOpen(false)}>{t('adminPanel')}</Link>
        )}
        {user.role === 'worker' && (
          <Link to="/worker" onClick={() => setMenuOpen(false)}>{t('workerPanel')}</Link>
        )}

        <Link to="/notifications" onClick={() => setMenuOpen(false)} className="notif-link">
          🔔 {unread > 0 && <span className="badge">{unread}</span>}
        </Link>

        <div className="lang-toggle" onClick={toggleLanguage}>
          <span className={lang === 'en' ? 'active' : ''}>EN</span>
          <div className={`toggle-switch ${lang === 'pa' ? 'toggled' : ''}`}>
            <div className="toggle-knob"></div>
          </div>
          <span className={lang === 'pa' ? 'active' : ''}>ਪੰ</span>
        </div>

        <div className="user-info">
          <span>👤 {user.name}</span>
          <span className="role-badge">{t(user.role)}</span>
        </div>

        <button className="btn-logout" onClick={handleLogout}>{t('logout')}</button>
      </div>
    </nav>
  );
};

export default Navbar;