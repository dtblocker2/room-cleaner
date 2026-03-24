import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import RoomCleaning from './pages/RoomCleaning';
import Complaints from './pages/Complaints';
import SmartLaundry from './pages/SmartLaundry';
import MessFeedback from './pages/MessFeedback';
import LostFound from './pages/LostFound';
import NoticeBoard from './pages/NoticeBoard';
import AdminPanel from './pages/AdminPanel';
import WorkerPanel from './pages/WorkerPanel';
import Notifications from './pages/Notifications';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="app">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/cleaning" element={
                  <ProtectedRoute><RoomCleaning /></ProtectedRoute>
                } />
                <Route path="/complaints/:category" element={
                  <ProtectedRoute><Complaints /></ProtectedRoute>
                } />
                <Route path="/laundry" element={
                  <ProtectedRoute><SmartLaundry /></ProtectedRoute>
                } />
                <Route path="/mess" element={
                  <ProtectedRoute><MessFeedback /></ProtectedRoute>
                } />
                <Route path="/lostfound" element={
                  <ProtectedRoute><LostFound /></ProtectedRoute>
                } />
                <Route path="/notices" element={
                  <ProtectedRoute><NoticeBoard /></ProtectedRoute>
                } />
                <Route path="/notifications" element={
                  <ProtectedRoute><Notifications /></ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute roles={['admin']}><AdminPanel /></ProtectedRoute>
                } />
                <Route path="/worker" element={
                  <ProtectedRoute roles={['worker']}><WorkerPanel /></ProtectedRoute>
                } />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;