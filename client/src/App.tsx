import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PermissionManagement from './pages/PermissionManagement';
import Consultations from './pages/Consultations';
import ConsultationForm from './pages/ConsultationForm';
import ConsultationDetail from './pages/ConsultationDetail';
import Cases from './pages/Cases';
import CaseForm from './pages/CaseForm';
import CaseDetail from './pages/CaseDetail';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/permissions" 
                element={
                  <ProtectedRoute requireRole="admin">
                    <PermissionManagement />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consultations" 
                element={
                  <ProtectedRoute>
                    <Consultations />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consultations/new" 
                element={
                  <ProtectedRoute>
                    <ConsultationForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/consultations/:id" 
                element={
                  <ProtectedRoute>
                    <ConsultationDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cases" 
                element={
                  <ProtectedRoute>
                    <Cases />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cases/new" 
                element={
                  <ProtectedRoute>
                    <CaseForm />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/cases/:id" 
                element={
                  <ProtectedRoute>
                    <CaseDetail />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/ai-assistant" 
                element={
                  <ProtectedRoute>
                    <AIAssistant />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;