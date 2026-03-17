import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StaffDashboard() {
  const { user, apiFetch } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const url = filter === 'all' ? '/api/tickets' : `/api/tickets?status=${filter}`;
    const [ticketRes, statsRes] = await Promise.all([
      apiFetch(url), apiFetch('/api/tickets/stats')
    ]);
    if (ticketRes.ok) setTickets(ticketRes.data.tickets);
    if (statsRes.ok) setStats(statsRes.data);
    setLoading(false);
  }, [apiFetch, filter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAccept = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    await apiFetch(`/api/tickets/${id}/accept`, { method: 'PUT' });
    fetchData();
  };

  const handleComplete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    await apiFetch(`/api/tickets/${id}/complete`, { method: 'PUT', body: JSON.stringify({}) });
    fetchData();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>🧹 Staff Dashboard</h1>
          <p className="greeting">Welcome, {user.name}</p>
        </div>
        <button className="btn btn-outline" onClick={fetchData}>🔄 Refresh</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card amber">
          <div className="stat-value">{stats.pending || 0}</div>
          <div className="stat-label">Pending</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-value">{stats.accepted || 0}</div>
          <div className="stat-label">Accepted</div>
        </div>
        <div className="stat-card green">
          <div className="stat-value">{stats.verified || 0}</div>
          <div className="stat-label">Verified</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgRating ? `${stats.avgRating} ⭐` : '—'}</div>
          <div className="stat-label">Avg Rating</div>
        </div>
      </div>

      <div className="filter-tabs">
        {['pending','accepted','completed','verified','all'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && stats.pending ? ` (${stats.pending})` : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen" style={{height:'200px'}}><div className="spinner"/></div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{filter === 'pending' ? '🎉' : '📋'}</div>
          <h3>{filter === 'pending' ? 'No pending requests!' : `No ${filter} tickets`}</h3>
          <p>{filter === 'pending' ? 'All caught up. Check back soon.' : 'Nothing here yet.'}</p>
        </div>
      ) : (
        <div className="ticket-list">
          {tickets.map(ticket => (
            <Link to={`/tickets/${ticket._id}`} key={ticket._id}
              className={`ticket-card priority-${ticket.priority}`}>
              <div className="ticket-card-header">
                <h3>Room {ticket.roomNumber}{ticket.hostelBlock ? ` • Block ${ticket.hostelBlock}` : ''}</h3>
                <div style={{display:'flex', gap:'6px'}}>
                  <span className={`badge badge-${ticket.priority}`}>{ticket.priority}</span>
                  <span className={`badge badge-${ticket.status}`}>{ticket.status}</span>
                </div>
              </div>
              <div className="ticket-card-meta">
                <span>👤 {ticket.student?.name}</span>
                <span>📅 {formatDate(ticket.date)}</span>
                <span>🕐 {ticket.timeFrom} – {ticket.timeTo}</span>
                {ticket.student?.phone && <span>📞 {ticket.student.phone}</span>}
              </div>
              {ticket.description && <p className="ticket-card-desc">{ticket.description}</p>}
              <div style={{marginTop:'12px', display:'flex', gap:'8px'}}>
                {ticket.status === 'pending' && (
                  <button className="btn btn-primary btn-sm" onClick={(e) => handleAccept(e, ticket._id)}>
                    ✅ Accept
                  </button>
                )}
                {ticket.status === 'accepted' && ticket.assignedTo?._id === user.id && (
                  <button className="btn btn-success btn-sm" onClick={(e) => handleComplete(e, ticket._id)}>
                    ✔️ Mark Complete
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}