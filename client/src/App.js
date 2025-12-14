import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Apply from './pages/Apply';
import CreateProfile from './pages/CreateProfile';
import VerifyEmail from './pages/VerifyEmail';
import LoginVerify from './pages/LoginVerify';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import JobManagement from './pages/JobManagement';
import Candidates from './pages/Candidates';
import RegisteredEmails from './pages/RegisteredEmails';
import ThankYou from './pages/ThankYou';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/admin');

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/create-profile" element={
          <ProtectedRoute>
            <CreateProfile />
          </ProtectedRoute>
        } />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/login-verify" element={<LoginVerify />} />
        <Route path="/apply/:jobId" element={
          <ProtectedRoute>
            <Apply />
          </ProtectedRoute>
        } />
        <Route path="/thank-you" element={<ThankYou />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
        } />
        <Route path="/admin/jobs" element={
            <PrivateRoute>
              <JobManagement />
            </PrivateRoute>
        } />
        <Route path="/admin/candidates" element={
            <PrivateRoute>
              <Candidates />
            </PrivateRoute>
        } />
        <Route path="/admin/registered-emails" element={
            <PrivateRoute>
              <RegisteredEmails />
            </PrivateRoute>
        } />
      </Routes>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;