import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const SmartLaundry = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ items: '', quantity: 1 });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const res = await api.get('/laundry');
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/laundry', form);
      setForm({ items: '', quantity: 1 });
      setShowForm(false);
      loadRequests();
    } catch (err) { alert('Error submitting'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/laundry/${id}`, { status });
      loadRequests();
    } catch (err) { console.error(err); }
  };

  const statusIcon = { pending: '⏳', 'in-progress': '🔄', completed: '✅' };

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <h1>👕 {t('smartLaundry')}</h1>

      {user.role === 'student' && (
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + {t('submitLaundry')}
        </button>
      )}

      {showForm && (
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('items')}</label>
            <textarea
              value={form.items}
              onChange={e => setForm({ ...form, items: e.target.value })}
              required rows={2}
              placeholder="e.g., 3 shirts, 2 pants, 1 bedsheet"
            />
          </div>
          <div className="form-group">
            <label>{t('quantity')}</label>
            <input type="number" min="1" value={form.quantity}
              onChange={e => setForm({ ...form, quantity: parseInt(e.target.value) })} />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn-primary">{t('submit')}</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>{t('cancel')}</button>
          </div>
        </form>
      )}

      <div className="requests-list">
        {requests.length === 0 && <p className="empty-text">{t('noLaundry')}</p>}
        {requests.map(req => (
          <div key={req._id} className="request-card">
            <div className="request-header">
              <span>{statusIcon[req.status]} {req.studentId?.name} - {t('room')} {req.studentId?.roomNumber}</span>
              <span className={`status-badge ${req.status}`}>
                {t(req.status === 'in-progress' ? 'inProgress' : req.status)}
              </span>
            </div>
            <p><strong>{t('items')}:</strong> {req.items}</p>
            <p><strong>{t('quantity')}:</strong> {req.quantity}</p>
            <p>{t('date')}: {new Date(req.submittedAt).toLocaleDateString()}</p>
            {req.completedAt && <p>{t('completed')}: {new Date(req.completedAt).toLocaleString()}</p>}

            {user.role === 'worker' && req.status === 'pending' && (
              <button className="btn-primary" onClick={() => updateStatus(req._id, 'in-progress')}>
                {t('startTask')}
              </button>
            )}
            {user.role === 'worker' && req.status === 'in-progress' && (
              <button className="btn-success" onClick={() => updateStatus(req._id, 'completed')}>
                {t('markComplete')}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartLaundry;