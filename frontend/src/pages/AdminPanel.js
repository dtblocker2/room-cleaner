import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api, { API_BASE } from '../utils/api';

const getImageUrl = (path) => {
  if (!path) return null;
  const serverRoot = API_BASE.replace('/api', '');
  return `${serverRoot}${path}`;
};

const AdminPanel = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => { loadData(); }, [filterCat, filterStatus]);

  const loadData = async () => {
    try {
      const [statsRes, workersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/workers')
      ]);
      setStats(statsRes.data);
      setWorkers(workersRes.data);

      let query = '/admin/complaints?';
      if (filterCat) query += `category=${filterCat}&`;
      if (filterStatus) query += `status=${filterStatus}`;
      const compRes = await api.get(query);
      setComplaints(compRes.data);
    } catch (err) { console.error(err); }
  };

  const assignWorker = async (complaintId, workerId) => {
    try {
      await api.put(`/admin/assign/${complaintId}`, { workerId });
      loadData();
    } catch (err) { alert('Error assigning'); }
  };

  const categories = ['internet', 'furniture', 'electricity', 'water', 'cleanliness'];
  const catIcons = { internet: '🌐', furniture: '🪑', electricity: '⚡', water: '💧', cleanliness: '🧼' };
  const catLabels = {
    internet: 'internetIssue', furniture: 'furnitureIssue',
    electricity: 'electricityIssue', water: 'waterIssue', cleanliness: 'cleanliness'
  };

  const topCategory = stats.categoryStats?.reduce((max, c) =>
    c.count > (max?.count || 0) ? c : max, null);

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <h1>⚙️ {t('adminPanel')}</h1>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">👥</div>
          <div className="stat-number">{stats.totalStudents || 0}</div>
          <div className="stat-label">{t('totalStudents')}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🔧</div>
          <div className="stat-number">{stats.totalWorkers || 0}</div>
          <div className="stat-label">{t('totalWorkers')}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📊</div>
          <div className="stat-number">{stats.totalComplaints || 0}</div>
          <div className="stat-label">{t('totalComplaints')}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⏳</div>
          <div className="stat-number">{stats.pendingComplaints || 0}</div>
          <div className="stat-label">{t('pendingQueries')}</div>
        </div>
      </div>

      <h2 className="section-title">{t('analytics')}</h2>
      <div className="category-bars">
        {stats.categoryStats?.map(cs => (
          <div key={cs._id} className="cat-bar">
            <span className="cat-label">{catIcons[cs._id]} {t(catLabels[cs._id])}</span>
            <div className="bar-container">
              <div className="bar-fill" style={{ width: `${(cs.count / (stats.totalComplaints || 1)) * 100}%` }}></div>
            </div>
            <span className="cat-count">{cs.count}</span>
          </div>
        ))}
      </div>
      {topCategory && (
        <p className="highlight-text">
          🏆 {t('mostComplaints')}: {catIcons[topCategory._id]} {t(catLabels[topCategory._id])} ({topCategory.count})
        </p>
      )}

      <h2 className="section-title">{t('allComplaints')}</h2>
      <div className="filter-bar">
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">{t('all')} {t('category')}</option>
          {categories.map(c => (
            <option key={c} value={c}>{t(catLabels[c])}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">{t('all')} {t('status')}</option>
          <option value="pending">{t('pending')}</option>
          <option value="in-progress">{t('inProgress')}</option>
          <option value="resolved">{t('resolved')}</option>
        </select>
      </div>

      <div className="complaints-list">
        {complaints.map(c => (
          <div key={c._id} className="complaint-card admin-view">
            <div className="complaint-header">
              <span>{catIcons[c.category]} {t(catLabels[c.category])}</span>
              <span className={`status-badge ${c.status}`}>
                {t(c.status === 'in-progress' ? 'inProgress' : c.status)}
              </span>
            </div>
            <p><strong>{c.userId?.name}</strong> - {t('room')} {c.roomNumber}, {c.hostelName}</p>
            <p>{c.description}</p>
            {c.subcategory && <p className="complaint-sub">{t(c.subcategory) || c.subcategory}</p>}
            {c.image && <img src={getImageUrl(c.image)} alt="" className="complaint-img" />}

            {c.assignedWorker ? (
              <p className="assigned-info">🔧 {t('assignWorker')}: {c.assignedWorker.name} ({c.assignedWorker.workerId})</p>
            ) : (
              <div className="assign-section">
                <select onChange={e => e.target.value && assignWorker(c._id, e.target.value)} defaultValue="">
                  <option value="">{t('selectWorker')}</option>
                  {workers.map(w => (
                    <option key={w._id} value={w._id}>{w.name} ({w.workerId})</option>
                  ))}
                </select>
              </div>
            )}
            <small>{new Date(c.createdAt).toLocaleString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;