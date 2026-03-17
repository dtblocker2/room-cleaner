import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const isActive = (path) => location.pathname === path ? 'active' : '';

  const navLinks = (
    <>
      <Link to="/dashboard" className={isActive('/dashboard')} onClick={() => setMenuOpen(false)}>
        📊 Dashboard
      </Link>
      {user?.role === 'student' && (
        <Link to="/tickets/new" className={isActive('/tickets/new')} onClick={() => setMenuOpen(false)}>
          ➕ New Ticket
        </Link>
      )}
      <Link to="/settings" className={isActive('/settings')} onClick={() => setMenuOpen(false)}>
        ⚙️ Settings
      </Link>
      <button className="nav-logout" onClick={() => { logout(); setMenuOpen(false); }}>
        🚪 Logout
      </button>
    </>
  );

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span>🧹</span> CleanMyRoom
        </Link>
        <div className="navbar-links">{navLinks}</div>
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {navLinks}
      </div>
    </nav>
  );
}