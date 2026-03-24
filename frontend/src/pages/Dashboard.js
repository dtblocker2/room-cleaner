import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [notifRes, complaintRes] = await Promise.all([
        api.get('/notifications'),
        api.get('/complaints')
      ]);
      setNotifications(notifRes.data.slice(0, 5));
      const complaints = complaintRes.data;
      setStats({
        total: complaints.length,
        pending: complaints.filter(c => c.status === 'pending').length,
        resolved: complaints.filter(c => c.status === 'resolved').length
      });
    } catch (err) {
      console.error(err);
    }
  };

  const features = [
    { key: 'roomCleaning', icon: '🧹', path: '/cleaning', roles: ['student', 'worker', 'admin'] },
    { key: 'internetIssue', icon: '🌐', path: '/complaints/internet', roles: ['student', 'admin'] },
    { key: 'furnitureIssue', icon: '🪑', path: '/complaints/furniture', roles: ['student', 'admin'] },
    { key: 'electricityIssue', icon: '⚡', path: '/complaints/electricity', roles: ['student', 'admin'] },
    { key: 'waterIssue', icon: '💧', path: '/complaints/water', roles: ['student', 'admin'] },
    { key: 'cleanliness', icon: '🧼', path: '/complaints/cleanliness', roles: ['student', 'worker', 'admin'] },
    { key: 'smartLaundry', icon: '👕', path: '/laundry', roles: ['student', 'worker', 'admin'] },
    { key: 'messFeedback', icon: '🍽️', path: '/mess', roles: ['student', 'admin'] },
    { key: 'lostAndFound', icon: '🔍', path: '/lostfound', roles: ['student', 'admin'] },
    { key: 'noticeBoard', icon: '📋', path: '/notices', roles: ['student', 'worker', 'admin'] },
  ];

  const visibleFeatures = features.filter(f => f.roles.includes(user.role));

  return (
    <div className="page-container">
      <div className="welcome-section">
        <h1>{t('welcome')}, {user.name}! 👋</h1>
        <p className="role-text">{t(user.role)} {user.roomNumber ? `• ${t('room')} ${user.roomNumber}` : ''}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">{t('totalQueries')}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⏳</div>
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">{t('pendingQueries')}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-number">{stats.resolved}</div>
          <div className="stat-label">{t('resolvedQueries')}</div>
        </div>
      </div>

      <h2 className="section-title">{t('quickActions')}</h2>
      <div className="features-grid">
        {visibleFeatures.map(feature => (
          <div
            key={feature.key}
            className="feature-card"
            onClick={() => navigate(feature.path)}
          >
            <div className="feature-icon">{feature.icon}</div>
            <div className="feature-label">{t(feature.key)}</div>
          </div>
        ))}

        {user.role === 'admin' && (
          <div className="feature-card" onClick={() => navigate('/admin')}>
            <div className="feature-icon">⚙️</div>
            <div className="feature-label">{t('adminPanel')}</div>
          </div>
        )}

        {user.role === 'worker' && (
          <div className="feature-card" onClick={() => navigate('/worker')}>
            <div className="feature-icon">📋</div>
            <div className="feature-label">{t('myTasks')}</div>
          </div>
        )}
      </div>

      <h2 className="section-title">{t('recentNotifications')}</h2>
      <div className="notifications-list">
        {notifications.length === 0 ? (
          <p className="empty-text">{t('noNotifications')}</p>
        ) : (
          notifications.map(n => (
            <div key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`}>
              <span className="notif-dot">●</span>
              <span className="notif-msg">{n.message}</span>
              <span className="notif-time">{new Date(n.createdAt).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;