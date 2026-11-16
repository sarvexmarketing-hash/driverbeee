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

// ─── SEO Slug Architecture Pages ─────────────────────────────────────────────
const CarsCatalogPage = React.lazy(() => import('./pages/CarsCatalogPage').then(m => ({ default: m.CarsCatalogPage })));
const BrandPage = React.lazy(() => import('./pages/BrandPage').then(m => ({ default: m.BrandPage })));
const ModelPage = React.lazy(() => import('./pages/ModelPage').then(m => ({ default: m.ModelPage })));
const VehicleDetailPage = React.lazy(() => import('./pages/VehicleDetailPage').then(m => ({ default: m.VehicleDetailPage })));
const CityHubPage = React.lazy(() => import('./pages/CityHubPage').then(m => ({ default: m.CityHubPage })));
const DealerPage = React.lazy(() => import('./pages/DealerPage').then(m => ({ default: m.DealerPage })));
const BlogIndexPage = React.lazy(() => import('./pages/BlogIndexPage').then(m => ({ default: m.BlogIndexPage })));
const BlogPostPage = React.lazy(() => import('./pages/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const LegacyRedirectPage = React.lazy(() => import('./pages/LegacyRedirectPage').then(m => ({ default: m.LegacyRedirectPage })));

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
                  <Route path="/forgot-password" element={<AuthPage portal="customer" initialMode="forgot" onSuccess={() => (window.location.href = '/')} />} />
                  <Route path="/reset-password" element={<AuthPage portal="customer" initialMode="reset" onSuccess={() => (window.location.href = '/')} />} />
                  <Route path="/admin" element={<AdminRoute />} />
                  <Route path="/driver" element={<DriverDashboard />} />
                  <Route path="/join-as-driver" element={<JoinAsDriverPage />} />
                  <Route path="/driver-onboarding" element={<JoinAsDriverPage />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/terms-and-conditions" element={<TermsAndConditions />} />

                  {/* ─── SEO Slug Architecture Routes ────────────────────────────── */}
                  <Route path="/cars" element={<CarsCatalogPage />} />
                  <Route path="/cars/:brandSlug" element={<BrandPage />} />
                  <Route path="/cars/:brandSlug/:modelSlug" element={<ModelPage />} />
                  <Route path="/cars/:brandSlug/:modelSlug/:vehicleSlug" element={<VehicleDetailPage />} />
                  <Route path="/city/:citySlug" element={<CityHubPage />} />
                  <Route path="/dealers/:citySlug/:dealerSlug" element={<DealerPage />} />
                  <Route path="/blog" element={<BlogIndexPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />

                  {/* ─── Backward Compatibility Redirects (IDs to Slugs) ─────────── */}
                  <Route path="/vehicle/:id" element={<LegacyRedirectPage entityType="vehicle" />} />
                  <Route path="/dealers/:id" element={<LegacyRedirectPage entityType="dealer" />} />

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
