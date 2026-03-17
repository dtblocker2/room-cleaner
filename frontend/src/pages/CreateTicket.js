import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function CreateTicket() {
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    date: today, timeFrom: '09:00', timeTo: '12:00',
    priority: 'medium', description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (f, v) => setForm({ ...form, [f]: v });

  if (!user.roomNumber) {
    return (
      <div className="fade-in" style={{maxWidth:'600px', margin:'0 auto'}}>
        <div className="alert alert-warning">
          ⚠️ Please set your room number before creating a ticket.
          <Link to="/settings" className="text-link" style={{marginLeft:'8px'}}>Go to Settings →</Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.timeTo <= form.timeFrom) {
      return setError('End time must be after start time');
    }
    setLoading(true);
    const { ok, data } = await apiFetch('/api/tickets', {
      method: 'POST', body: JSON.stringify(form)
    });
    if (ok) navigate('/dashboard');
    else setError(data.message || 'Failed to create ticket');
    setLoading(false);
  };

  return (
    <div className="fade-in" style={{maxWidth:'600px', margin:'0 auto'}}>
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>
      <div className="settings-section">
        <h2>🧹 New Cleaning Request</h2>

        <div className="alert alert-info" style={{marginBottom:'20px'}}>
          Room <strong>{user.roomNumber}</strong>
          {user.hostelBlock && <>, Block <strong>{user.hostelBlock}</strong></>}
        </div>

        {error && (
          <div className="alert alert-error">
            {error} <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <input type="date" required min={today} value={form.date}
              onChange={e => update('date', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Available From</label>
              <input type="time" required value={form.timeFrom}
                onChange={e => update('timeFrom', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Available Until</label>
              <input type="time" required value={form.timeTo}
                onChange={e => update('timeTo', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={form.priority} onChange={e => update('priority', e.target.value)}>
              <option value="low">🟢 Low — routine cleaning</option>
              <option value="medium">🔵 Medium — needs cleaning soon</option>
              <option value="high">🟠 High — dirty / guests coming</option>
              <option value="urgent">🔴 Urgent — spill / emergency</option>
            </select>
          </div>
          <div className="form-group">
            <label>Special Instructions (optional)</label>
            <textarea placeholder="e.g. Please mop under the bed, focus on bathroom..."
              value={form.description} onChange={e => update('description', e.target.value)} />
          </div>
          <div style={{display:'flex', gap:'10px'}}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : '📩 Submit Request'}
            </button>
            <Link to="/dashboard" className="btn btn-outline">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}