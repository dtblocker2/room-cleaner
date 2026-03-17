import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import StaffDashboard from './pages/StaffDashboard';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Settings from './pages/Settings';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {user && <Navbar />}
      <div className={user ? 'main-content' : ''}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              {user?.role === 'staff' ? <StaffDashboard /> : <StudentDashboard />}
            </ProtectedRoute>
          } />
          <Route path="/tickets/new" element={
            <ProtectedRoute><CreateTicket /></ProtectedRoute>
          } />
          <Route path="/tickets/:id" element={
            <ProtectedRoute><TicketDetail /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><Settings /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}