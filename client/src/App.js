import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Contact from './pages/Contact';
import Careers from './pages/Careers';
import Apply from './pages/Apply';
import CreateProfile from './pages/CreateProfile';
import VerifyEmail from './pages/VerifyEmail';
import LoginVerify from './pages/LoginVerify';
import ThankYou from './pages/ThankYou';
import PrivateRoute from './components/PrivateRoute';
import ProtectedRoute from './components/ProtectedRoute';

const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const JobManagement = lazy(() => import('./pages/JobManagement'));
const Candidates = lazy(() => import('./pages/Candidates'));
const RegisteredEmails = lazy(() => import('./pages/RegisteredEmails'));

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith('/admin');

  return (
    <>
      {!hideNavbar && <Header />}
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-theme-blue"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }>
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
      </Suspense>
      {!hideNavbar && <Footer />}
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