import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user, apiFetch } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
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

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  const needsAction = (stats.completed || 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1>👋 Hi, {user.name?.split(' ')[0]}!</h1>
          <p className="greeting">
            {user.roomNumber ? `Room ${user.roomNumber}${user.hostelBlock ? `, Block ${user.hostelBlock}` : ''}` : 
             <Link to="/settings" className="text-link">Set your room number →</Link>}
          </p>
        </div>
        <Link to="/tickets/new" className="btn btn-primary">➕ New Ticket</Link>
      </div>

      {needsAction > 0 && (
        <div className="alert alert-info">
          🔔 You have {needsAction} ticket{needsAction > 1 ? 's' : ''} waiting for your verification!
          <button onClick={() => setFilter('completed')}>View</button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total || 0}</div>
          <div className="stat-label">Total</div>
        </div>
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
      </div>

      <div className="filter-tabs">
        {['all','pending','accepted','completed','verified'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-screen" style={{height:'200px'}}><div className="spinner"/></div>
      ) : tickets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No tickets {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
          <p>Create your first cleaning request to get started</p>
          <Link to="/tickets/new" className="btn btn-primary">Create Ticket</Link>
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
                <span>📅 {formatDate(ticket.date)}</span>
                <span>🕐 {ticket.timeFrom} – {ticket.timeTo}</span>
                {ticket.assignedTo && <span>👤 {ticket.assignedTo.name}</span>}
              </div>
              {ticket.description && <p className="ticket-card-desc">{ticket.description}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}