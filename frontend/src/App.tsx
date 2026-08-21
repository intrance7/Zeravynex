import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import AuthPage from './AuthPage';
import DashboardLayout from './DashboardLayout';
import DashboardMain from './DashboardMain';
import AnalysisContent from './AnalysisContent';
import HistoryContent from './HistoryContent';
import LandingPage from './LandingPage';
import ReportView from './ReportView';
import ComingSoon from './ComingSoon';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" theme="system" />
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
              <AuthPage onLogin={() => setIsAuthenticated(true)} />
            )
          } 
        />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard" 
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<DashboardMain />} />
          <Route path="analyze" element={<AnalysisContent />} />
          <Route path="report" element={<ReportView />} />
          <Route path="history" element={<HistoryContent />} />
          <Route path="investigations" element={<ComingSoon title="Investigations" />} />
          <Route path="samples" element={<ComingSoon title="Samples" />} />
          <Route path="intel" element={<ComingSoon title="Threat Intelligence" />} />
          <Route path="graph" element={<ComingSoon title="Threat Graph" />} />
          <Route path="reports" element={<ComingSoon title="Reports" />} />
          <Route path="collections" element={<ComingSoon title="Collections" />} />
          <Route path="api" element={<ComingSoon title="API" />} />
          <Route path="usage" element={<ComingSoon title="Usage" />} />
          <Route path="billing" element={<ComingSoon title="Billing" />} />
          <Route path="settings" element={<ComingSoon title="Settings" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
