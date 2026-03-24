import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const Notifications = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => { loadNotifications(); }, []);

  const loadNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) { console.error(err); }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      loadNotifications();
    } catch (err) { console.error(err); }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      loadNotifications();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <div className="page-header-row">
        <h1>🔔 {t('notifications')}</h1>
        <button className="btn-secondary" onClick={markAllRead}>{t('markAllRead')}</button>
      </div>

      <div className="notifications-page-list">
        {notifications.length === 0 && <p className="empty-text">{t('noNotifications')}</p>}
        {notifications.map(n => (
          <div
            key={n._id}
            className={`notif-card ${n.read ? 'read' : 'unread'}`}
            onClick={() => !n.read && markRead(n._id)}
          >
            <div className="notif-icon">{n.read ? '📭' : '📬'}</div>
            <div className="notif-body">
              <p className="notif-message">{n.message}</p>
              <small className="notif-time">{new Date(n.createdAt).toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;