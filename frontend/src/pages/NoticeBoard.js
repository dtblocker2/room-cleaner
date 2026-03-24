import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const NoticeBoard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', targetAudience: 'all' });

  useEffect(() => { loadNotices(); }, []);

  const loadNotices = async () => {
    try {
      const res = await api.get('/notices');
      setNotices(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', form);
      setForm({ title: '', content: '', targetAudience: 'all' });
      setShowForm(false);
      loadNotices();
    } catch (err) { alert('Error posting notice'); }
  };

  const deleteNotice = async (id) => {
    if (!window.confirm('Delete this notice?')) return;
    try {
      await api.delete(`/notices/${id}`);
      loadNotices();
    } catch (err) { console.error(err); }
  };

  const audienceBadge = { students: '🎓', workers: '🔧', all: '👥' };

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <h1>📋 {t('noticeBoard')}</h1>

      {user.role === 'admin' && (
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + {t('postNotice')}
        </button>
      )}

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('title')}</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>{t('content')}</label>
            <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required rows={4} />
          </div>
          <div className="form-group">
            <label>{t('targetAudience')}</label>
            <select value={form.targetAudience} onChange={e => setForm({ ...form, targetAudience: e.target.value })}>
              <option value="all">{t('all')}</option>
              <option value="students">{t('students')}</option>
              <option value="workers">{t('workers')}</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{t('submit')}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="notices-list">
        {notices.length === 0 && <p className="empty-text">{t('noNotices')}</p>}
        {notices.map(notice => (
          <div key={notice._id} className="notice-card">
            <div className="notice-header">
              <h3>{notice.title}</h3>
              <span className="audience-badge">
                {audienceBadge[notice.targetAudience]} {t(notice.targetAudience)}
              </span>
            </div>
            <p className="notice-content">{notice.content}</p>
            <div className="notice-footer">
              <span>{t('postedBy')}: {notice.postedBy?.name}</span>
              <span>{new Date(notice.createdAt).toLocaleDateString()}</span>
              {user.role === 'admin' && (
                <button className="btn-delete" onClick={() => deleteNotice(notice._id)}>🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NoticeBoard;