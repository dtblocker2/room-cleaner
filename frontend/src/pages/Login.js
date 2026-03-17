import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { ok, message } = await login(form.email, form.password);
    if (!ok) setError(message || 'Login failed');
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-card fade-in">
        <div className="logo-text">🧹</div>
        <h1>Welcome Back</h1>
        <p className="subtitle">Sign in to CleanMyRoom</p>

        {error && (
          <div className="alert alert-error">
            {error} <button onClick={() => setError('')}>×</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required placeholder="you@example.com" value={form.email}
              onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register" className="text-link">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}