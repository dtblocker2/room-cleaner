import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';

const WorkerPanel = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState({ complaints: [], cleaningTasks: [], laundryTasks: [] });
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('complaints');

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    try {
      const [tasksRes, statsRes] = await Promise.all([
        api.get('/worker/tasks'),
        api.get('/worker/stats')
      ]);
      setTasks(tasksRes.data);
      setStats(statsRes.data);
    } catch (err) { console.error(err); }
  };

  const updateComplaint = async (id, status) => {
    try {
      await api.put(`/worker/tasks/${id}`, { status, taskType: 'complaint' });
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const updateCleaning = async (id, status) => {
    try {
      await api.put(`/cleaning/${id}`, { status });
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const updateLaundry = async (id, status) => {
    try {
      await api.put(`/laundry/${id}`, { status });
      loadTasks();
    } catch (err) { console.error(err); }
  };

  const catIcons = { internet: '🌐', furniture: '🪑', electricity: '⚡', water: '💧', cleanliness: '🧼' };

  return (
    <div className="page-container">
      <button className="btn-back" onClick={() => navigate('/dashboard')}>← {t('back')}</button>
      <h1>📋 {t('workerPanel')}</h1>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-number">{stats.assignedComplaints || 0}</div>
          <div className="stat-label">{t('complaintTasks')}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{stats.completedComplaints || 0}</div>
          <div className="stat-label">{t('completed')}</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-number">{stats.pendingCleaning || 0}</div>
          <div className="stat-label">{t('cleaningTasks')}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}>
          🔧 {t('complaintTasks')} ({tasks.complaints?.length || 0})
        </button>
        <button className={`tab ${activeTab === 'cleaning' ? 'active' : ''}`}
          onClick={() => setActiveTab('cleaning')}>
          🧹 {t('cleaningTasks')} ({tasks.cleaningTasks?.length || 0})
        </button>
        <button className={`tab ${activeTab === 'laundry' ? 'active' : ''}`}
          onClick={() => setActiveTab('laundry')}>
          👕 {t('laundryTasks')} ({tasks.laundryTasks?.length || 0})
        </button>
      </div>

      {/* Complaint Tasks */}
      {activeTab === 'complaints' && (
        <div className="tasks-list">
          {tasks.complaints?.length === 0 && <p className="empty-text">{t('noTasks')}</p>}
          {tasks.complaints?.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <span>{catIcons[task.category]} {task.category}</span>
                <span className={`status-badge ${task.status}`}>
                  {t(task.status === 'in-progress' ? 'inProgress' : task.status)}
                </span>
              </div>
              <p><strong>🚪 {t('room')} {task.roomNumber}</strong> - {task.hostelName}</p>
              <p>👤 {task.userId?.name}</p>
              <p>{task.description}</p>

              {task.status === 'in-progress' && (
                <button className="btn-success btn-large" onClick={() => updateComplaint(task._id, 'resolved')}>
                  ✅ {t('markComplete')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cleaning Tasks */}
      {activeTab === 'cleaning' && (
        <div className="tasks-list">
          {tasks.cleaningTasks?.length === 0 && <p className="empty-text">{t('noTasks')}</p>}
          {tasks.cleaningTasks?.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <span>🚪 {t('room')} {task.roomNumber}</span>
                <span className={`status-badge ${task.status}`}>
                  {t(task.status === 'in-progress' ? 'inProgress' : task.status)}
                </span>
              </div>
              <p>👤 {task.studentId?.name}</p>
              <p>⏰ {task.requestedTimeSlot}</p>

              {task.status === 'pending' && (
                <button className="btn-primary btn-large" onClick={() => updateCleaning(task._id, 'accepted')}>
                  {t('acceptTask')}
                </button>
              )}
              {task.status === 'accepted' && (
                <button className="btn-success btn-large" onClick={() => updateCleaning(task._id, 'completed')}>
                  ✅ {t('markComplete')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Laundry Tasks */}
      {activeTab === 'laundry' && (
        <div className="tasks-list">
          {tasks.laundryTasks?.length === 0 && <p className="empty-text">{t('noTasks')}</p>}
          {tasks.laundryTasks?.map(task => (
            <div key={task._id} className="task-card">
              <div className="task-header">
                <span>👤 {task.studentId?.name} - {t('room')} {task.studentId?.roomNumber}</span>
                <span className={`status-badge ${task.status}`}>
                  {t(task.status === 'in-progress' ? 'inProgress' : task.status)}
                </span>
              </div>
              <p><strong>{t('items')}:</strong> {task.items}</p>
              <p><strong>{t('quantity')}:</strong> {task.quantity}</p>

              {task.status === 'pending' && (
                <button className="btn-primary btn-large" onClick={() => updateLaundry(task._id, 'in-progress')}>
                  {t('startTask')}
                </button>
              )}
              {task.status === 'in-progress' && (
                <button className="btn-success btn-large" onClick={() => updateLaundry(task._id, 'completed')}>
                  ✅ {t('markComplete')}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerPanel;