import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import App from './App';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPage } from './pages/AuthPage';
import './index.css';

// ─── Loading Screen ──────────────────────────────────────────────────────────
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-navy-950">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-bee-400 border-t-transparent rounded-full animate-spin" />
      <span className="text-white font-medium text-sm">Loading DriverBee...</span>
    </div>
  </div>
);

// ─── Auth-gated route wrappers ────────────────────────────────────────────────

const AdminRoute: React.FC = () => {
  const { user, profile, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <AuthPage portal="admin" onSuccess={() => window.location.reload()} />;
  if (profile && profile.role !== 'admin') return <Navigate to="/" replace />;
  return <AdminDashboard />;
};

// ─── App Root ─────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <BookingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<AuthPage portal="customer" initialMode="login" onSuccess={() => (window.location.href = '/')} />} />
            <Route path="/signup" element={<AuthPage portal="customer" initialMode="signup" onSuccess={() => (window.location.href = '/')} />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/admin/login" element={<AuthPage portal="admin" onSuccess={() => (window.location.href = '/admin')} />} />
            <Route path="/driver/*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </BookingProvider>
    </AuthProvider>
  </React.StrictMode>
);
