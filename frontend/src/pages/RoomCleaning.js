import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import StarRating from '../components/StarRating';
import api from '../utils/api';

const timeSlots = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM'
];

const RoomCleaning = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [ratingData, setRatingData] = useState({});

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const res = await api.get('/cleaning');
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const submitRequest = async () => {
    if (!selectedSlot) return;
    try {
      await api.post('/cleaning', { requestedTimeSlot: selectedSlot });
      setSelectedSlot('');
      loadRequests();
    } catch (err) { alert(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/cleaning/${id}`, { status });
      loadRequests();
    } catch (err) { console.error(err); }
  };

  const submitRating = async (id) => {
    const data = ratingData[id];
    if (!data?.rating) return;
    try {
      await api.put(`/cleaning/${id}/rate`, data);
      loadRequests();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <h1>🧹 {t('roomCleaning')}</h1>

      {user.role === 'student' && (
        <div className="card">
          <h3>{t('requestCleaning')}</h3>
          <label>{t('selectTimeSlot')}</label>
          <div className="time-slots">
            {timeSlots.map(slot => (
              <button
                key={slot}
                className={`slot-btn ${selectedSlot === slot ? 'active' : ''}`}
                onClick={() => setSelectedSlot(slot)}
              >
                {slot}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={submitRequest} disabled={!selectedSlot}>
            {t('submit')}
          </button>
        </div>
      )}

      <h3>{user.role === 'student' ? t('myComplaints') : t('cleaningTasks')}</h3>
      <div className="requests-list">
        {requests.length === 0 && <p className="empty-text">{t('noComplaints')}</p>}
        {requests.map(req => (
          <div key={req._id} className="request-card">
            <div className="request-header">
              <span>🚪 {t('room')} {req.roomNumber}</span>
              <span className={`status-badge ${req.status}`}>{t(req.status === 'in-progress' ? 'inProgress' : req.status)}</span>
            </div>
            <p>⏰ {req.requestedTimeSlot}</p>
            {req.workerId && <p>{t('cleanedBy')}: {req.workerId.name}</p>}
            {req.cleanedAt && <p>{t('lastCleaned')}: {new Date(req.cleanedAt).toLocaleString()}</p>}
            <p>{t('date')}: {new Date(req.createdAt).toLocaleDateString()}</p>

            {user.role === 'worker' && req.status === 'pending' && (
              <button className="btn-primary" onClick={() => updateStatus(req._id, 'accepted')}>
                {t('acceptTask')}
              </button>
            )}
            {user.role === 'worker' && req.status === 'accepted' && (
              <button className="btn-success" onClick={() => updateStatus(req._id, 'completed')}>
                {t('markComplete')}
              </button>
            )}

            {user.role === 'student' && req.status === 'completed' && !req.rating && (
              <div className="rating-section">
                <h4>{t('rateCleaning')}</h4>
                <StarRating
                  rating={ratingData[req._id]?.rating || 0}
                  onRate={(r) => setRatingData({ ...ratingData, [req._id]: { ...ratingData[req._id], rating: r } })}
                />
                <textarea
                  placeholder={t('yourFeedback')}
                  value={ratingData[req._id]?.feedback || ''}
                  onChange={e => setRatingData({
                    ...ratingData,
                    [req._id]: { ...ratingData[req._id], feedback: e.target.value }
                  })}
                />
                <button className="btn-primary" onClick={() => submitRating(req._id)}>
                  {t('submit')}
                </button>
              </div>
            )}

            {req.rating && (
              <div className="rating-display">
                <StarRating rating={req.rating} size={20} />
                {req.feedback && <p className="feedback-text">"{req.feedback}"</p>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomCleaning;