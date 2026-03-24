import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api, { API_BASE } from '../utils/api';

const getImageUrl = (path) => {
  if (!path) return null;
  const serverRoot = API_BASE.replace('/api', '');
  return `${serverRoot}${path}`;
};

const subcategories = {
  internet: ['wifiNotWorking', 'ethernetIssue', 'routerIssue', 'slowSpeed'],
  furniture: ['brokenChair', 'brokenDesk', 'brokenBed', 'missingFurniture', 'otherFurniture'],
  electricity: ['switchNotWorking', 'fanIssue', 'lightIssue', 'plugPoint'],
  water: ['drinkingWaterQuality', 'coolerNotWorking', 'waterAvailability', 'leakage'],
  cleanliness: ['washroomCleaning', 'floorCleaning', 'bathroomNoLock', 'bathroomBroken'],
};

const categoryIcons = {
  internet: '🌐', furniture: '🪑', electricity: '⚡', water: '💧', cleanliness: '🧼'
};

const Complaints = () => {
  const { category } = useParams();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subcategory: '', description: '', floorNumber: '' });
  const [image, setImage] = useState(null);

  useEffect(() => { loadComplaints(); }, [category]);

  const loadComplaints = async () => {
    try {
      const res = await api.get(`/complaints?category=${category}`);
      setComplaints(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('subcategory', form.subcategory);
      formData.append('description', form.description);
      if (form.floorNumber) formData.append('floorNumber', form.floorNumber);
      if (image) formData.append('image', image);

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowForm(false);
      setForm({ subcategory: '', description: '', floorNumber: '' });
      setImage(null);
      loadComplaints();
    } catch (err) { alert(err.response?.data?.message || 'Error submitting'); }
  };

  const categoryTitle = {
    internet: 'internetIssue', furniture: 'furnitureIssue',
    electricity: 'electricityIssue', water: 'waterIssue', cleanliness: 'cleanliness'
  };

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <h1>{categoryIcons[category]} {t(categoryTitle[category])}</h1>

      {user.role === 'student' && (
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + {t('raiseComplaint')}
        </button>
      )}

      {showForm && (
        <form className="complaint-form card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('subcategory')}</label>
            <select value={form.subcategory} onChange={e => setForm({ ...form, subcategory: e.target.value })} required>
              <option value="">{t('subcategory')}</option>
              {subcategories[category]?.map(sub => (
                <option key={sub} value={sub}>{t(sub)}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>{t('description')}</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={3} />
          </div>
          {(category === 'cleanliness') && (
            <div className="form-group">
              <label>{t('floor')}</label>
              <input type="text" value={form.floorNumber} onChange={e => setForm({ ...form, floorNumber: e.target.value })} />
            </div>
          )}
          <div className="form-group">
            <label>{t('addImage')}</label>
            <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{t('submit')}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="complaints-list">
        {complaints.length === 0 && <p className="empty-text">{t('noComplaints')}</p>}
        {complaints.map(c => (
          <div key={c._id} className="complaint-card">
            <div className="complaint-header">
              <span className="complaint-sub">{t(c.subcategory) || c.subcategory}</span>
              <span className={`status-badge ${c.status}`}>
                {t(c.status === 'in-progress' ? 'inProgress' : c.status)}
              </span>
            </div>
            <p className="complaint-desc">{c.description}</p>
            {c.roomNumber && <p>🚪 {t('room')}: {c.roomNumber}</p>}
            {c.floorNumber && <p>🏢 {t('floor')}: {c.floorNumber}</p>}
            {c.assignedWorker && <p>🔧 {c.assignedWorker.name}</p>}
            {c.image && <img src={getImageUrl(c.image)} alt="complaint" className="complaint-img" />}
            <p className="complaint-date">{new Date(c.createdAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Complaints;