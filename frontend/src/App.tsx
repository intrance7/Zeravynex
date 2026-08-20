import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import AuthPage from './AuthPage';
import DashboardLayout from './DashboardLayout';
import DashboardMain from './DashboardMain';
import AnalysisContent from './AnalysisContent';
import HistoryContent from './HistoryContent';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <BrowserRouter>
      <Toaster position="bottom-right" theme="system" />
      <Routes>
        {/* Auth Route */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/" replace />
            ) : (
              <AuthPage onLogin={() => setIsAuthenticated(true)} />
            )
          } 
        />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/" 
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={() => setIsAuthenticated(false)} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route index element={<DashboardMain />} />
          <Route path="analysis" element={<AnalysisContent />} />
          <Route path="history" element={<HistoryContent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
