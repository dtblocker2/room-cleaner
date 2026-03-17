import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user, apiFetch, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user.name || '', email: user.email || '',
    roomNumber: user.roomNumber || '', hostelBlock: user.hostelBlock || '',
    phone: user.phone || ''
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [profileMsg, setProfileMsg] = useState(null);
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true); setProfileMsg(null);
    const { ok, data } = await apiFetch('/api/users/profile', {
      method: 'PUT', body: JSON.stringify(profile)
    });
    if (ok) {
      updateUser(data.user);
      setProfileMsg({ type: 'success', text: 'Profile updated!' });
    } else {
      setProfileMsg({ type: 'error', text: data.message });
    }
    setSaving(false);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwords.newPassword !== passwords.confirmPassword) {
      return setPasswordMsg({ type: 'error', text: 'Passwords do not match' });
    }
    if (passwords.newPassword.length < 6) {
      return setPasswordMsg({ type: 'error', text: 'Minimum 6 characters' });
    }
    setSaving(true);
    const { ok, data } = await apiFetch('/api/users/password', {
      method: 'PUT', body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      })
    });
    if (ok) {
      setPasswordMsg({ type: 'success', text: 'Password changed!' });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setPasswordMsg({ type: 'error', text: data.message });
    }
    setSaving(false);
  };

  return (
    <div className="settings-page fade-in">
      <h1 style={{fontSize:'1.6rem', fontWeight:800, marginBottom:'24px'}}>⚙️ Settings</h1>

      <div className="settings-section">
        <h2>👤 Profile Information</h2>
        {profileMsg && (
          <div className={`alert alert-${profileMsg.type}`}>
            {profileMsg.text} <button onClick={() => setProfileMsg(null)}>×</button>
          </div>
        )}
        <form onSubmit={handleProfileSave}>
          <div className="form-group">
            <label>Full Name</label>
            <input required value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={profile.email}
              onChange={e => setProfile({...profile, email: e.target.value})} />
          </div>
          {user.role === 'student' && (
            <div className="form-row">
              <div className="form-group">
                <label>Room Number</label>
                <input placeholder="e.g. 101" value={profile.roomNumber}
                  onChange={e => setProfile({...profile, roomNumber: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Hostel Block</label>
                <input placeholder="e.g. A" value={profile.hostelBlock}
                  onChange={e => setProfile({...profile, hostelBlock: e.target.value})} />
              </div>
            </div>
          )}
          <div className="form-group">
            <label>Phone Number</label>
            <input placeholder="Your phone number" value={profile.phone}
              onChange={e => setProfile({...profile, phone: e.target.value})} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2>🔒 Change Password</h2>
        {passwordMsg && (
          <div className={`alert alert-${passwordMsg.type}`}>
            {passwordMsg.text} <button onClick={() => setPasswordMsg(null)}>×</button>
          </div>
        )}
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" required value={passwords.currentPassword}
              onChange={e => setPasswords({...passwords, currentPassword: e.target.value})} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <input type="password" required placeholder="Min 6 chars" value={passwords.newPassword}
                onChange={e => setPasswords({...passwords, newPassword: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input type="password" required value={passwords.confirmPassword}
                onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Updating...' : '🔑 Update Password'}
          </button>
        </form>
      </div>

      <div className="settings-section">
        <h2>ℹ️ Account Info</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <label>Role</label>
            <p><span className={`role-badge ${user.role}`}>{user.role}</span></p>
          </div>
          <div className="detail-item">
            <label>Account ID</label>
            <p style={{fontSize:'.8rem', color:'var(--text-muted)'}}>{user.id}</p>
          </div>
        </div>
      </div>
    </div>
  );
}