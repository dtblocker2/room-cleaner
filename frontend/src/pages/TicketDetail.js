import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function StarRating({ rating, setRating, readonly }) {
  return (
    <div className={readonly ? 'star-display' : 'star-rating'}>
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button" className={`star ${i <= rating ? 'filled' : 'empty'}`}
          onClick={() => !readonly && setRating(i)} disabled={readonly}>
          {i <= rating ? '★' : '☆'}
        </button>
      ))}
    </div>
  );
}

const STEPS = ['pending', 'accepted', 'completed', 'verified'];

function StatusTimeline({ status }) {
  const currentIdx = STEPS.indexOf(status);
  return (
    <div className="status-timeline">
      {STEPS.map((step, i) => (
        <React.Fragment key={step}>
          {i > 0 && <div className={`timeline-connector ${i <= currentIdx ? 'done' : ''}`} />}
          <div className={`timeline-step ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}>
            <div className="timeline-dot">
              {i < currentIdx ? '✓' : i === currentIdx ? '●' : (i+1)}
            </div>
            {step.charAt(0).toUpperCase() + step.slice(1)}
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const { user, apiFetch } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [staffNotes, setStaffNotes] = useState('');
  const [message, setMessage] = useState(null);

  const fetchTicket = useCallback(async () => {
    const { ok, data } = await apiFetch(`/api/tickets/${id}`);
    if (ok) setTicket(data);
    else setMessage({ type: 'error', text: 'Ticket not found' });
    setLoading(false);
  }, [apiFetch, id]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const doAction = async (action, body = {}) => {
    setActionLoading(true);
    const { ok, data } = await apiFetch(`/api/tickets/${id}/${action}`, {
      method: 'PUT', body: JSON.stringify(body)
    });
    if (ok) { setTicket(data); setMessage({ type: 'success', text: 'Action completed!' }); }
    else setMessage({ type: 'error', text: data.message });
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Cancel this ticket?')) return;
    setActionLoading(true);
    const { ok } = await apiFetch(`/api/tickets/${id}`, { method: 'DELETE' });
    if (ok) navigate('/dashboard');
    else setMessage({ type: 'error', text: 'Failed to cancel' });
    setActionLoading(false);
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  if (loading) return <div className="loading-screen" style={{height:'50vh'}}><div className="spinner"/></div>;
  if (!ticket) return <div className="alert alert-error">Ticket not found. <Link to="/dashboard">Go back</Link></div>;

  const isStudent = user.role === 'student';
  const isAssignedStaff = user.role === 'staff' && ticket.assignedTo?._id === user.id;

  return (
    <div className="detail-page fade-in">
      <Link to="/dashboard" className="back-link">← Back to Dashboard</Link>

      {message && (
        <div className={`alert alert-${message.type}`}>
          {message.text} <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <div className="detail-card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px'}}>
          <h1>Room {ticket.roomNumber}{ticket.hostelBlock ? ` • Block ${ticket.hostelBlock}` : ''}</h1>
          <div style={{display:'flex', gap:'6px'}}>
            <span className={`badge badge-${ticket.priority}`}>{ticket.priority}</span>
            <span className={`badge badge-${ticket.status}`}>{ticket.status}</span>
          </div>
        </div>

        <StatusTimeline status={ticket.status} />

        <div className="detail-grid">
          <div className="detail-item">
            <label>📅 Date</label>
            <p>{formatDate(ticket.date)}</p>
          </div>
          <div className="detail-item">
            <label>🕐 Time Window</label>
            <p>{ticket.timeFrom} – {ticket.timeTo}</p>
          </div>
          <div className="detail-item">
            <label>👤 Student</label>
            <p>{ticket.student?.name}</p>
          </div>
          <div className="detail-item">
            <label>📞 Phone</label>
            <p>{ticket.student?.phone || '—'}</p>
          </div>
          {ticket.assignedTo && (
            <>
              <div className="detail-item">
                <label>🧹 Assigned Staff</label>
                <p>{ticket.assignedTo.name}</p>
              </div>
              <div className="detail-item">
                <label>📞 Staff Phone</label>
                <p>{ticket.assignedTo.phone || '—'}</p>
              </div>
            </>
          )}
          <div className="detail-item">
            <label>📋 Created</label>
            <p>{formatDate(ticket.createdAt)}</p>
          </div>
          {ticket.completedAt && (
            <div className="detail-item">
              <label>✅ Completed</label>
              <p>{formatDate(ticket.completedAt)}</p>
            </div>
          )}
        </div>

        {ticket.description && (
          <div className="detail-section">
            <h2>📝 Special Instructions</h2>
            <p style={{color: 'var(--text-secondary)', fontSize:'.9rem'}}>{ticket.description}</p>
          </div>
        )}

        {ticket.staffNotes && (
          <div className="detail-section">
            <h2>📋 Staff Notes</h2>
            <p style={{color: 'var(--text-secondary)', fontSize:'.9rem'}}>{ticket.staffNotes}</p>
          </div>
        )}

        {ticket.status === 'verified' && ticket.rating && (
          <div className="detail-section">
            <h2>⭐ Rating & Feedback</h2>
            <StarRating rating={ticket.rating} readonly />
            {ticket.feedback && (
              <p style={{color: 'var(--text-secondary)', fontSize:'.9rem', marginTop:'8px'}}>
                "{ticket.feedback}"
              </p>
            )}
          </div>
        )}

        {/* ACTIONS */}
        <div className="detail-actions">
          {/* Student: cancel pending ticket */}
          {isStudent && ticket.status === 'pending' && (
            <button className="btn btn-outline-danger btn-sm" onClick={handleDelete}
              disabled={actionLoading}>🗑️ Cancel Ticket</button>
          )}

          {/* Staff: accept pending ticket */}
          {user.role === 'staff' && ticket.status === 'pending' && (
            <button className="btn btn-primary" onClick={() => doAction('accept')}
              disabled={actionLoading}>✅ Accept This Ticket</button>
          )}

          {/* Staff: mark complete */}
          {isAssignedStaff && ticket.status === 'accepted' && (
            <div style={{width:'100%'}}>
              <div className="form-group">
                <label>Staff Notes (optional)</label>
                <textarea placeholder="Any notes about the cleaning..." value={staffNotes}
                  onChange={e => setStaffNotes(e.target.value)} />
              </div>
              <button className="btn btn-success" disabled={actionLoading}
                onClick={() => doAction('complete', { staffNotes })}>
                ✔️ Mark as Complete
              </button>
            </div>
          )}

          {/* Student: verify or reject */}
          {isStudent && ticket.status === 'completed' && (
            <div style={{width:'100%'}}>
              <h2 style={{marginBottom:'12px'}}>Verify Cleaning</h2>
              <div className="form-group">
                <label>Rate the cleaning</label>
                <StarRating rating={rating} setRating={setRating} />
              </div>
              <div className="form-group">
                <label>Feedback (optional)</label>
                <textarea placeholder="How was the cleaning?" value={feedback}
                  onChange={e => setFeedback(e.target.value)} />
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                <button className="btn btn-success" disabled={actionLoading || !rating}
                  onClick={() => doAction('verify', { rating, feedback })}>
                  ✅ Verify — Looks Good!
                </button>
                <button className="btn btn-outline-danger" disabled={actionLoading}
                  onClick={() => {
                    const reason = window.prompt('Why are you rejecting? (This resets the ticket to pending)');
                    if (reason !== null) doAction('reject', { feedback: reason });
                  }}>
                  ❌ Reject
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}