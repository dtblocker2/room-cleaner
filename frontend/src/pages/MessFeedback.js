import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from '../components/StarRating';
import api, { API_BASE } from '../utils/api';

// Helper: build full image URL dynamically
const getImageUrl = (path) => {
  if (!path) return null;
  // API_BASE is like http://192.168.1.5:5000/api
  // We need http://192.168.1.5:5000 + path
  const serverRoot = API_BASE.replace('/api', '');
  return `${serverRoot}${path}`;
};

const MessFeedback = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState([]);
  const [form, setForm] = useState({ mealType: 'breakfast', rating: 0, feedback: '' });
  const [image, setImage] = useState(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [fbRes, statsRes] = await Promise.all([
        api.get('/mess'),
        api.get('/mess/stats')
      ]);
      setFeedbacks(fbRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) return alert('Please select a rating');
    try {
      const formData = new FormData();
      formData.append('mealType', form.mealType);
      formData.append('rating', form.rating);
      formData.append('feedback', form.feedback);
      if (image) formData.append('image', image);

      await api.post('/mess', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ mealType: 'breakfast', rating: 0, feedback: '' });
      setImage(null);
      setShowForm(false);
      loadData();
    } catch (err) { alert('Error submitting'); }
  };

  const mealIcons = { breakfast: '🌅', lunch: '☀️', dinner: '🌙' };

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <h1>🍽️ {t('messFeedback')}</h1>

      <div className="stats-grid">
        {['breakfast', 'lunch', 'dinner'].map(meal => {
          const stat = stats.find(s => s._id === meal);
          return (
            <div key={meal} className="stat-card">
              <div className="stat-icon">{mealIcons[meal]}</div>
              <div className="stat-label">{t(meal)}</div>
              <div className="stat-number">{stat ? stat.avgRating.toFixed(1) : '-'}</div>
              <StarRating rating={Math.round(stat?.avgRating || 0)} size={18} />
              <small>{stat?.count || 0} {t('rating')}s</small>
            </div>
          );
        })}
      </div>

      {user.role === 'student' && (
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + {t('submitFeedback')}
        </button>
      )}

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('mealType')}</label>
            <select value={form.mealType} onChange={e => setForm({ ...form, mealType: e.target.value })}>
              <option value="breakfast">{t('breakfast')}</option>
              <option value="lunch">{t('lunch')}</option>
              <option value="dinner">{t('dinner')}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t('rating')}</label>
            <StarRating rating={form.rating} onRate={(r) => setForm({ ...form, rating: r })} />
          </div>
          <div className="form-group">
            <label>{t('feedback')}</label>
            <textarea value={form.feedback} onChange={e => setForm({ ...form, feedback: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>{t('uploadFoodImage')}</label>
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{t('submit')}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}

      <h3>{t('feedback')}</h3>
      <div className="feedback-list">
        {feedbacks.map(fb => (
          <div key={fb._id} className="feedback-card">
            <div className="feedback-header">
              <span>{mealIcons[fb.mealType]} {t(fb.mealType)}</span>
              <StarRating rating={fb.rating} size={18} />
            </div>
            {fb.studentId && <p className="feedback-author">- {fb.studentId.name}</p>}
            {fb.feedback && <p className="feedback-text">"{fb.feedback}"</p>}
            {fb.image && <img src={getImageUrl(fb.image)} alt="food" className="feedback-img" />}
            <small>{new Date(fb.date).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MessFeedback;