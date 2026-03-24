import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api, { API_BASE } from '../utils/api';

const getImageUrl = (path) => {
  if (!path) return null;
  const serverRoot = API_BASE.replace('/api', '');
  return `${serverRoot}${path}`;
};

const LostFound = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'lost', title: '', description: '', location: '', collectFrom: '' });
  const [images, setImages] = useState([]);

  useEffect(() => { loadItems(); }, [filter]);

  const loadItems = async () => {
    try {
      const query = filter ? `?type=${filter}` : '';
      const res = await api.get(`/lostfound${query}`);
      setItems(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => formData.append(key, form[key]));
      images.forEach(img => formData.append('images', img));

      await api.post('/lostfound', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm({ type: 'lost', title: '', description: '', location: '', collectFrom: '' });
      setImages([]);
      setShowForm(false);
      loadItems();
    } catch (err) { alert('Error posting'); }
  };

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <h1>🔍 {t('lostAndFound')}</h1>

      <div className="filter-bar">
        <button className={`filter-btn ${filter === '' ? 'active' : ''}`} onClick={() => setFilter('')}>{t('all')}</button>
        <button className={`filter-btn ${filter === 'lost' ? 'active' : ''}`} onClick={() => setFilter('lost')}>🔴 {t('lost')}</button>
        <button className={`filter-btn ${filter === 'found' ? 'active' : ''}`} onClick={() => setFilter('found')}>🟢 {t('found')}</button>
      </div>

      <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ {t('postItem')}</button>

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="type-selector">
              <button type="button" className={`type-btn ${form.type === 'lost' ? 'active lost' : ''}`}
                onClick={() => setForm({ ...form, type: 'lost' })}>🔴 {t('lost')}</button>
              <button type="button" className={`type-btn ${form.type === 'found' ? 'active found' : ''}`}
                onClick={() => setForm({ ...form, type: 'found' })}>🟢 {t('found')}</button>
            </div>
          </div>
          <div className="form-group">
            <label>{t('title')}</label>
            <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>{t('description')}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} />
          </div>
          <div className="form-group">
            <label>{t('location')}</label>
            <input type="text" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>{t('collectFrom')}</label>
            <input type="text" value={form.collectFrom} onChange={e => setForm({ ...form, collectFrom: e.target.value })} />
          </div>
          <div className="form-group">
            <label>{t('uploadImages')}</label>
            <input type="file" accept="image/*" multiple onChange={e => setImages([...e.target.files])} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{t('submit')}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="lf-grid">
        {items.length === 0 && <p className="empty-text">{t('noItems')}</p>}
        {items.map(item => (
          <div key={item._id} className={`lf-card ${item.type}`}>
            <div className="lf-badge">{item.type === 'lost' ? '🔴 ' + t('lost') : '🟢 ' + t('found')}</div>
            {item.images?.length > 0 && (
              <img src={getImageUrl(item.images[0])} alt={item.title} className="lf-img" />
            )}
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <p>📍 {item.location}</p>
            {item.collectFrom && <p>🏢 {t('collectFrom')}: {item.collectFrom}</p>}
            <p className="lf-author">{t('postedBy')}: {item.postedBy?.name}</p>
            <small>{new Date(item.createdAt).toLocaleDateString()}</small>
            <span className={`status-badge ${item.status}`}>{t(item.status)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LostFound;