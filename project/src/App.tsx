import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthForm from './components/auth/AuthForm';
import HomePage from './pages/HomePage';
import RegisterFarmPage from './pages/RegisterFarmPage';
import PredictionPage from './pages/PredictionPage';
import AssistantPage from './pages/AssistantPage';

type ProtectedRouteProps = {
  children: React.ReactNode;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  useEffect(() => {
    document.title = 'AgroDiversificación - Valle del Cauca';
  }, []);

  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/auth" element={<AuthForm />} />
          
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/registrar-finca" 
            element={
              <ProtectedRoute>
                <RegisterFarmPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/prediccion" 
            element={
              <ProtectedRoute>
                <PredictionPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/asistente" 
            element={
              <ProtectedRoute>
                <AssistantPage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
};

export default AppRoutes;
