import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './context/BookingContext';
import { AuthProvider } from './context/AuthContext';
import { PricingProvider } from './context/PricingContext';
import App from './App';
import './index.css';

const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AuthPage = React.lazy(() => import('./pages/AuthPage').then(m => ({ default: m.AuthPage })));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })));
const TermsAndConditions = React.lazy(() => import('./pages/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })));
const DriverDashboard = React.lazy(() => import('./pages/DriverDashboard').then(m => ({ default: m.DriverDashboard })));
const JoinAsDriverPage = React.lazy(() => import('./pages/JoinAsDriverPage').then(m => ({ default: m.JoinAsDriverPage })));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

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
  return <AdminDashboard />;
};

// ─── Error Boundary ──────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-4 text-2xl font-bold">
            !
          </div>
          <h1 className="text-xl font-extrabold text-navy-950 mb-2">Something went wrong</h1>
          <p className="text-sm text-gray-500 max-w-sm mb-6">
            We encountered an unexpected error. Please refresh the page or head back to home.
          </p>
          <button
            onClick={() => {
              window.location.href = '/';
            }}
            className="px-5 py-2.5 bg-bee-600 hover:bg-bee-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors"
          >
            Reload DriverBee
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── App Root ─────────────────────────────────────────────────────────────────
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <BookingProvider>
          <PricingProvider>
            <BrowserRouter>
              <React.Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/login" element={<AuthPage portal="customer" initialMode="login" onSuccess={() => (window.location.href = '/')} />} />
                  <Route path="/signup" element={<AuthPage portal="customer" initialMode="signup" onSuccess={() => (window.location.href = '/')} />} />
                  <Route path="/admin" element={<AdminRoute />} />
                  <Route path="/driver" element={<DriverDashboard />} />
                  <Route path="/join-as-driver" element={<JoinAsDriverPage />} />
                  <Route path="/driver-onboarding" element={<JoinAsDriverPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </React.Suspense>
            </BrowserRouter>
          </PricingProvider>
        </BookingProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
