import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    roomNumber: '', hostelBlock: '', phone: '', staffCode: ''
  });
  const [isStaff, setIsStaff] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    const payload = { ...form };
    if (!isStaff) delete payload.staffCode;
    delete payload.confirmPassword;
    const { ok, message } = await register(payload);
    if (!ok) setError(message || 'Registration failed');
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="logo-text">🧹</div>
        <h1>Create Account</h1>
        <p className="subtitle">Join CleanMyRoom today</p>

        {error && (
          <div className="alert alert-error">
            {error} <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input required placeholder="John Doe" value={form.name}
              onChange={e => update('name', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required placeholder="you@example.com" value={form.email}
              onChange={e => update('email', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Password</label>
              <input type="password" required placeholder="Min 6 chars" value={form.password}
                onChange={e => update('password', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <input type="password" required placeholder="Re-enter" value={form.confirmPassword}
                onChange={e => update('confirmPassword', e.target.value)} />
            </div>
          </div>

          <div className="staff-code-toggle">
            <input type="checkbox" id="staffToggle" checked={isStaff}
              onChange={e => setIsStaff(e.target.checked)} />
            <label htmlFor="staffToggle">I am cleaning staff</label>
          </div>

          {isStaff ? (
            <div className="form-group">
              <label>Staff Registration Code</label>
              <input required placeholder="Enter staff code" value={form.staffCode}
                onChange={e => update('staffCode', e.target.value)} />
              <p className="input-hint">Get this code from your hostel admin</p>
            </div>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Room Number</label>
                  <input placeholder="e.g. 101" value={form.roomNumber}
                    onChange={e => update('roomNumber', e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Hostel Block</label>
                  <input placeholder="e.g. A" value={form.hostelBlock}
                    onChange={e => update('hostelBlock', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input placeholder="Optional" value={form.phone}
                  onChange={e => update('phone', e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login" className="text-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
}