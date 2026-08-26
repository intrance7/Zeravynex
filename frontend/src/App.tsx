import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from './store/authStore';

import { ShieldAlert, Activity } from 'lucide-react';
import ErrorState from './ErrorState';

// Lazy loading views
const AuthPage = lazy(() => import('./AuthPage'));
const DashboardLayout = lazy(() => import('./DashboardLayout'));
const DashboardMain = lazy(() => import('./DashboardMain'));
const AnalysisContent = lazy(() => import('./AnalysisContent'));
const HistoryContent = lazy(() => import('./HistoryContent'));
const LandingPage = lazy(() => import('./LandingPage'));
const ReportView = lazy(() => import('./ReportView'));
const ComingSoon = lazy(() => import('./ComingSoon'));
const SettingsView = lazy(() => import('./SettingsView'));
const PricingView = lazy(() => import('./PricingView'));
const InvestigationsView = lazy(() => import('./InvestigationsView'));
const CollectionsView = lazy(() => import('./CollectionsView'));
const ReportExperience = lazy(() => import('./ReportExperience'));
const ThreatGraphView = lazy(() => import('./ThreatGraphView'));
const ThreatIntelView = lazy(() => import('./ThreatIntelView'));

function SuspenseFallback() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
      <Activity className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

function App() {
  const { isAuthenticated, login, logout } = useAuthStore();

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" theme="system" />
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth Route */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <AuthPage onLogin={() => login({ id: '1', name: 'Admin', email: 'admin@zeravynex.com', role: 'admin' })} />
              )
            } 
          />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              isAuthenticated ? (
                <DashboardLayout onLogout={() => logout()} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          >
            <Route index element={<DashboardMain />} />
            <Route path="analyze" element={<AnalysisContent />} />
            <Route path="report" element={<ReportView />} />
            <Route path="history" element={<HistoryContent />} />
            <Route path="investigations" element={<InvestigationsView />} />
            <Route path="samples" element={<ComingSoon title="Samples" />} />
            <Route path="intel" element={<ThreatIntelView />} />
            <Route path="graph" element={<ThreatGraphView />} />
            <Route path="reports" element={<ReportExperience />} />
            <Route path="collections" element={<CollectionsView />} />
            <Route path="api" element={<ComingSoon title="API" />} />
            <Route path="usage" element={<ComingSoon title="Usage" />} />
            <Route path="billing" element={<Navigate to="/dashboard/settings" replace />} />
            <Route path="settings" element={<SettingsView />} />
            <Route path="pricing" element={<PricingView />} />
          </Route>

          {/* Global 404 Error Route */}
          <Route 
            path="*" 
            element={
              <div className="h-screen w-full flex items-center justify-center bg-background">
                <ErrorState 
                  icon={<ShieldAlert className="w-10 h-10 text-destructive" />}
                  title="404 - Page Not Found" 
                  description="The page you are looking for does not exist or has been moved." 
                  action={{ label: 'Return to Dashboard', onClick: () => window.location.href = '/dashboard' }} 
                />
              </div>
            } 
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
