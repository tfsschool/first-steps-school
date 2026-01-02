import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const Careers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    isAuthenticated, 
    userEmail, 
    loading: authLoading, 
    authChecked,
    hasProfile: authHasProfile,
    applicationStatus,
    logout
  } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localHasProfile, setLocalHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileName, setProfileName] = useState(null);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [allApplications, setAllApplications] = useState([]);
  
  // Use hasProfile from AuthContext (more reliable) or fallback to local state
  const hasProfile = authHasProfile || localHasProfile;
  const isProfileLocked = applicationStatus?.isLocked || false;
  
  // Helper function to get status colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', textLight: 'text-orange-700', icon: 'text-orange-600' };
      case 'Reviewed':
        return { bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-800', textLight: 'text-blue-700', icon: 'text-blue-600' };
      case 'Rejected':
        return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-800', textLight: 'text-red-700', icon: 'text-red-600' };
      case 'Selected':
        return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-800', textLight: 'text-green-700', icon: 'text-green-600' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-800', textLight: 'text-gray-700', icon: 'text-gray-600' };
    }
  };
  
  // Modal states
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showAlreadyAppliedModal, setShowAlreadyAppliedModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'apply' or 'profile'
  
  // Form states
  const [emailInput, setEmailInput] = useState('');
  const [registering, setRegistering] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [isUnverified, setIsUnverified] = useState(false);
  const [showNotRegisteredInLogin, setShowNotRegisteredInLogin] = useState(false);
  const [bannerStatus, setBannerStatus] = useState('idle'); // 'idle', 'verification_sent', 'login_link_sent'
  const [bannerEmail, setBannerEmail] = useState(''); // Store email for banner display

  // Fetch jobs ONCE on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.PUBLIC.JOBS);
        // Ensure res.data is an array before setting
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError('Error loading job positions. Please try again later.');
        setJobs([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();

    // If coming from verification page, show success message
    if (searchParams.get('verified') === 'true') {
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch profile and application data - single source of truth from backend
  const fetchProfileAndApplications = useCallback(async () => {
    console.log('[Careers] fetchProfileAndApplications called', {
      authChecked,
      authLoading,
      isAuthenticated,
      userEmail
    });

    if (!authChecked || authLoading) {
      console.log('[Careers] Waiting for auth check to complete');
      return; // Wait for auth check to complete
    }

    if (!isAuthenticated) {
      console.log('[Careers] User not authenticated, clearing profile state');
      setLocalHasProfile(false);
      setProfileName(null);
      setProfileLoading(false);
      setAppliedJobIds(new Set());
      return;
    }

    console.log('[Careers] User authenticated, fetching profile...');
    setProfileLoading(true);
    try {
      // Always get fresh token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLocalHasProfile(false);
        setProfileName(null);
        setProfileLoading(false);
        return;
      }
      
      const config = { headers: { 'x-auth-token': token }, withCredentials: true };
      
      // Fetch profile and applications in parallel from backend
      const [profileRes, applicationsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.PROFILE.GET, config),
        axios.get(API_ENDPOINTS.CANDIDATE.APPLICATIONS, config).catch(() => ({ data: [] }))
      ]);
      
      if (profileRes.data) {
        console.log('[Careers] Profile found:', {
          fullName: profileRes.data.fullName
        });
        setLocalHasProfile(true);
        setProfileName(profileRes.data.fullName || userEmail);
      } else {
        console.log('[Careers] No profile data returned');
        setLocalHasProfile(false);
        setProfileName(null);
      }
      
      // Store applied job IDs as a Set for O(1) lookup and all applications
      if (applicationsRes.data && Array.isArray(applicationsRes.data)) {
        const jobIds = applicationsRes.data.map(app => app.jobId?._id || app.jobId);
        setAppliedJobIds(new Set(jobIds));
        setAllApplications(applicationsRes.data);
      }
    } catch (err) {
      // Handle 404 - profile not found (normal for new users)
      if (err.response?.status === 404) {
        console.log('[Careers] Profile not found (404) - new user, showing Create Profile');
        setLocalHasProfile(false);
        setProfileName(null);
      }
      // Handle 401/403 - token invalid, clear state and logout
      else if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('[Careers] Invalid token (401/403), logging out');
        setLocalHasProfile(false);
        setProfileName(null);
        setAppliedJobIds(new Set());
        // Token is invalid, trigger logout
        logout();
      }
      // Handle 503 - service unavailable (don't retry)
      else if (err.response?.status === 503) {
        console.log('[Careers] Service unavailable (503)');
        setLocalHasProfile(false);
        setProfileName(null);
      }
      // Other errors - don't clear state, just log
      else {
        console.error('[Careers] Error fetching profile:', err);
      }
    } finally {
      console.log('[Careers] Profile fetch complete, hasProfile:', hasProfile);
      setProfileLoading(false);
    }
  }, [isAuthenticated, authChecked, authLoading, userEmail, logout]);

  // Fetch on mount and when auth changes
  useEffect(() => {
    fetchProfileAndApplications();
  }, [fetchProfileAndApplications]);

  // Re-fetch when page becomes visible (user returns from another tab/page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isAuthenticated) {
        // Page is now visible - re-fetch to ensure fresh data
        fetchProfileAndApplications();
      }
    };

    const handleFocus = () => {
      if (isAuthenticated) {
        // Window regained focus - re-fetch to ensure fresh data
        fetchProfileAndApplications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, fetchProfileAndApplications]);

  if (loading || authLoading || profileLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-theme-blue/20 border-t-theme-green animate-spin" />
          <div className="mt-4 text-lg font-semibold text-theme-dark">Loading available positions...</div>
        </div>
      </div>
    );
  }

  // Show initial choice modal (Registered? Yes/No)
  const showInitialChoice = (action) => {
    setPendingAction(action);
    setShowInitialModal(true);
  };

  // Handle "Yes, I'm registered" - show login modal
  const handleRegisteredYes = () => {
    setShowInitialModal(false);
    setShowLoginModal(true);
    setEmailInput('');
    setLoginMessage('');
    setShowNotRegisteredInLogin(false);
  };

  // Handle "No, I'm new" - show registration modal
  const handleRegisteredNo = () => {
    setShowInitialModal(false);
    setShowRegisterModal(true);
    setEmailInput('');
    setRegisterMessage('');
    setIsUnverified(false);
  };

  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setLoginMessage('Please enter a valid email address');
      return;
    }

    setLoggingIn(true);
    setLoginMessage('');
    setShowNotRegisteredInLogin(false);

    try {
      await axios.post(API_ENDPOINTS.CANDIDATE.LOGIN, {
        email: emailInput.trim()
      }, {
        withCredentials: true
      });

      // Login link sent successfully
      setLoginMessage('Login link has been sent to your mail. Please check your inbox.');
      setIsUnverified(false);
      setBannerStatus('login_link_sent');
      setBannerEmail(emailInput.trim());
      setShowLoginModal(false);
    } catch (err) {
      if (err.response?.data?.notRegistered) {
        // Email not registered - show message with register button
        setShowNotRegisteredInLogin(true);
        setLoginMessage('');
      } else if (err.response?.data?.notVerified) {
        // Not verified - show message and resend option
        setLoginMessage('Your email is not verified. Please check your inbox and click the verification link. If you did not receive the email, you can resend it below.');
        setIsUnverified(true);
      } else {
        setLoginMessage(err.response?.data?.msg || 'Failed to send login link. Please try again.');
      }
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle registration submission
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setRegisterMessage('Please enter a valid email address');
      return;
    }

    setRegistering(true);
    setRegisterMessage('');

    try {
      const res = await axios.post(API_ENDPOINTS.CANDIDATE.REGISTER, {
        email: emailInput.trim()
      });

      if (res.data.alreadyRegistered) {
        setRegisterMessage('This email is already registered. Please login.');
        setRegistering(false);
        return;
      }

      setRegisterMessage('Verification email has been sent to your mail. Please check your inbox.');
      setIsUnverified(false);
      setBannerStatus('verification_sent');
      setShowRegisterModal(false);
      setEmailInput('');
      setRegisterMessage('');
    } catch (err) {
      if (err.response?.data?.alreadyRegistered) {
        setRegisterMessage('This email is already registered and verified. Please login.');
        setIsUnverified(false);
      } else {
        setRegisterMessage(err.response?.data?.msg || 'Registration failed. Please try again.');
      }
    } finally {
      setRegistering(false);
    }
  };

  // Handle resend verification
  const handleResendVerification = async () => {
    if (!emailInput.trim() || !emailInput.includes('@')) {
      setRegisterMessage('Please enter a valid email address');
      return;
    }

    setRegistering(true);
    setRegisterMessage('Resending verification email...');

    try {
      await axios.post(API_ENDPOINTS.CANDIDATE.REGISTER, {
        email: emailInput.trim()
      });

      setRegisterMessage('Verification email resent! Please check your inbox and click the verification link. The link will expire in 24 hours.');
      
      setTimeout(() => {
        setRegisterMessage('');
      }, 5000);
    } catch (err) {
      setRegisterMessage(err.response?.data?.msg || 'Failed to resend verification email. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  // Handle Create Profile button
  const handleCreateProfile = async () => {
    if (isAuthenticated) {
      // User is authenticated - navigate to profile page
      navigate('/create-profile');
      return;
    }

    // User not authenticated - show initial choice modal
    showInitialChoice('profile');
  };

  // Handle Apply button
  const handleApply = async (jobId) => {
    if (!isAuthenticated) {
      // User not authenticated - show initial choice modal
      showInitialChoice('apply');
      return;
    }

    // User is authenticated - check if already applied
    try {
      const checkAppRes = await axios.get(API_ENDPOINTS.APPLICATION.CHECK(jobId), {
        withCredentials: true
      });
      
      if (checkAppRes.data.applied) {
        // Already applied - show popup
        setShowAlreadyAppliedModal(true);
        return;
      }
    } catch (err) {
      // Could not check application status
    }

    // Check if profile exists and is complete
    try {
      const profileRes = await axios.get(API_ENDPOINTS.PROFILE.GET, {
        withCredentials: true
      });
      const profile = profileRes.data;

      const getMissingRequiredFields = (p) => {
        const missing = [];
        const safe = p || {};

        if (!safe.fullName || !String(safe.fullName).trim()) missing.push('Full Name');
        if (!safe.dateOfBirth) missing.push('Date of Birth');
        if (!safe.gender) missing.push('Gender');

        if (!safe.cnic || !String(safe.cnic).trim()) {
          missing.push('CNIC');
        } else {
          const cleanedCnic = String(safe.cnic).replace(/[-\s]/g, '');
          if (!/^\d{13}$/.test(cleanedCnic)) missing.push('CNIC (must be 13 digits)');
        }

        if (!safe.phone || !String(safe.phone).trim()) missing.push('Cell Number');
        if (!safe.email || !String(safe.email).trim()) missing.push('Email');
        if (!safe.address || !String(safe.address).trim()) missing.push('Address');

        const education = Array.isArray(safe.education) ? safe.education : [];
        if (education.length === 0) {
          missing.push('Education (at least one entry)');
        } else {
          education.forEach((edu, index) => {
            const row = index + 1;
            if (!edu?.degree || !String(edu.degree).trim()) missing.push(`Education #${row}: Degree`);
            if (!edu?.institution || !String(edu.institution).trim()) missing.push(`Education #${row}: Institution`);
            if (!edu?.yearOfCompletion || !String(edu.yearOfCompletion).trim()) missing.push(`Education #${row}: Year`);
          });
        }

        if (!safe.resumePath) missing.push('Resume');
        return missing;
      };

      const missing = getMissingRequiredFields(profile);
      if (missing.length === 0) {
        // Profile is complete, navigate to apply page
        navigate(`/apply/${jobId}`);
      } else {
        // Profile is incomplete, show a clear list
        const message = `You can save an incomplete profile, but you must complete the following required fields before applying:\n\n${missing.join('\n')}\n\nWould you like to complete your profile now?`;
        if (window.confirm(message)) {
          navigate('/create-profile');
        }
      }
    } catch (err) {
      // Profile doesn't exist
      if (window.confirm('You need to create a profile first. Would you like to create one now?')) {
        navigate('/create-profile');
      }
    }
  };

  // Handle logout
  const handleLogout = async () => {
    await logout();
    setShowInitialModal(false);
    setShowLoginModal(false);
    setShowRegisterModal(false);
    setEmailInput('');
  };

  return (
    <>
      <SEO 
        title="Careers - Join Our Team" 
        description="Explore exciting career opportunities at The First Steps School. We're always looking for passionate educators and staff members to join our team."
        canonicalUrl="/careers"
      />
      <div className="min-h-screen bg-white">
        <section className="relative bg-theme-blue">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-20"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2400&q=80)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-theme-blue via-theme-blue/90 to-theme-blue/70" />
          <div className="relative container mx-auto px-4 py-14">
            <div className="max-w-3xl">
              <div className="text-white/80 text-xs tracking-[0.35em] uppercase font-semibold">
                Careers
              </div>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Join Our Team
              </h1>
              <p className="mt-4 text-white/85 text-base md:text-lg leading-relaxed">
                Explore exciting career opportunities at The First Steps School.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">

            {!profileLoading && (
              <>
                {/* Case A: Not Logged In */}
                {!isAuthenticated && (
                  <div className="max-w-5xl mx-auto mb-8">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-5 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          {bannerStatus === 'idle' && (
                            <p className="text-sm sm:text-base text-gray-700">
                              You must be registered to apply for any job or position.
                            </p>
                          )}
                          {bannerStatus === 'verification_sent' && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm sm:text-base text-green-700 font-semibold">
                                ✓ Verification email has been sent to your mail box. Please verify your account.
                              </p>
                            </div>
                          )}
                          {bannerStatus === 'login_link_sent' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <p className="text-sm sm:text-base text-blue-700 font-semibold">
                                ✓ Login link has been sent to your email <span className="font-bold">({bannerEmail})</span> box to login.
                              </p>
                            </div>
                          )}
                        </div>
                        {bannerStatus === 'idle' && (
                          <div className="flex flex-col xs:flex-row gap-3 sm:items-center">
                            <button
                              onClick={handleRegisteredNo}
                              className="btn-primary w-full sm:w-auto"
                            >
                              Create an account to get started
                            </button>
                            <button
                              onClick={handleRegisteredYes}
                              className="bg-theme-blue text-white px-6 py-3 font-semibold hover:brightness-95 transition w-full sm:w-auto"
                            >
                              Already have an account? Log in
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Case B: Logged In but NO Profile */}
                {isAuthenticated && !hasProfile && (
                  <div className="max-w-5xl mx-auto mb-8">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-5 sm:p-6">
                      <div className="flex flex-col gap-4">
                        <div>
                          <p className="text-sm sm:text-base text-gray-700 mb-2">
                            Logged in as: <span className="font-semibold text-theme-dark block sm:inline">{userEmail}</span>
                          </p>
                          <p className="text-sm sm:text-base text-gray-700 mb-2">
                            Before applying for any position, please complete your applicant profile.
                          </p>
                          <p className="text-sm sm:text-base text-gray-700">
                            This profile will be automatically attached to every job application you submit.
                          </p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                          <p className="text-sm text-amber-700">
                            ⚠️ Important: Once you apply for a position, your profile will be locked and cannot be edited.
                            Please review all information carefully before proceeding.
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <button
                            onClick={handleLogout}
                            className="text-xs font-semibold text-theme-blue hover:text-theme-green transition"
                          >
                            Logout
                          </button>
                          <button
                            onClick={() => navigate('/create-profile')}
                            className="btn-primary"
                          >
                            Create Your Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Case C: Logged In and Profile EXISTS */}
                {isAuthenticated && hasProfile && (
                  <div className="max-w-5xl mx-auto mb-8">
                    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-5 sm:p-6">
                      {/* Application Status Badges - Show ALL applications */}
                      {allApplications.length > 0 && (
                        <div className="mb-4 space-y-3">
                          {allApplications.map((app, index) => {
                            const colors = getStatusColor(app.status);
                            const isLocked = ['Pending', 'Reviewed'].includes(app.status);
                            return (
                              <div key={app._id || index} className={`p-4 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
                                <div className="flex items-center gap-3">
                                  <svg className={`w-6 h-6 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isLocked ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    ) : app.status === 'Rejected' ? (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    ) : (
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    )}
                                  </svg>
                                  <div className="flex-1">
                                    <p className={`font-bold ${colors.text}`}>
                                      {app.jobId?.title || 'Job Application'}
                                    </p>
                                    <p className={`text-sm ${colors.textLight}`}>
                                      Status: <span className="font-semibold">{app.status}</span>
                                      {isLocked && ' • Profile Locked'}
                                      {app.appliedAt && ` • Applied ${new Date(app.appliedAt).toLocaleDateString()}`}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm sm:text-base text-gray-700 mb-2">
                            Logged in as:{' '}
                            <span className="font-semibold text-theme-dark block sm:inline">
                              {profileName || userEmail}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            {userEmail}
                          </p>
                          {!isProfileLocked && (
                            <p className="text-sm sm:text-base text-gray-700 mt-1">
                              You may update your profile or apply for available positions.
                              Please note that once you submit an application, your profile will no longer be editable.
                            </p>
                          )}
                          {isProfileLocked && (
                            <p className="text-sm sm:text-base text-yellow-700 mt-1 font-semibold">
                              Your profile is locked due to active job applications.
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={handleLogout}
                            className="text-xs font-semibold text-theme-blue hover:text-theme-green transition"
                          >
                            Logout
                          </button>
                          <button
                            onClick={() => navigate('/create-profile')}
                            className="btn-primary"
                          >
                            {isProfileLocked ? 'View Profile' : 'Update Profile'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="max-w-3xl mx-auto mb-8 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg">
                {error}
              </div>
            )}

        {/* Initial Choice Modal - "Have you already registered?" */}
        {showInitialModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-lift border border-gray-100 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between">
                <div>
                  <div className="text-[11px] tracking-[0.32em] uppercase text-theme-dark/60 font-semibold">Get Started</div>
                  <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-theme-dark leading-tight">Have you already registered?</h2>
                  <p className="mt-2 text-gray-600">
                    {pendingAction === 'apply'
                      ? 'Please login or register to apply for this job position.'
                      : 'Please login or register to create your profile.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowInitialModal(false);
                    setPendingAction(null);
                  }}
                  className="h-10 w-10 rounded-full grid place-items-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleRegisteredYes}
                    className="w-full bg-theme-blue text-white px-6 py-3.5 font-semibold shadow-sm hover:brightness-95 transition flex items-center justify-center gap-3"
                  >
                    <span className="h-8 w-8 rounded-full bg-white/15 border border-white/15 grid place-items-center">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    Create an account to get started
                  </button>
                  <button
                    onClick={handleRegisteredNo}
                    className="w-full bg-theme-dark text-white px-6 py-3.5 font-semibold shadow-sm hover:brightness-95 transition flex items-center justify-center gap-3"
                  >
                    <span className="h-8 w-8 rounded-full bg-white/15 border border-white/15 grid place-items-center">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                    Already have an account? Log in
                  </button>
                  <button
                    onClick={() => {
                      setShowInitialModal(false);
                      setPendingAction(null);
                    }}
                    className="w-full bg-gray-100 text-theme-dark px-6 py-3.5 rounded-lg font-semibold hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-5 text-xs text-gray-500 leading-relaxed">
                  By continuing, you agree to receive emails related to verification and login.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-lift border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="text-xs tracking-[0.3em] uppercase text-theme-dark/60 font-semibold">Candidate Login</div>
              <h2 className="mt-3 text-2xl font-extrabold text-theme-dark mb-2">Login</h2>
              <p className="text-gray-600 mb-5">
                Enter your registered email to receive a login link.
              </p>
              <form onSubmit={handleLogin}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setLoginMessage('');
                    setShowNotRegisteredInLogin(false);
                    setIsUnverified(false);
                  }}
                  placeholder="your.email@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
                  required
                  autoFocus
                  disabled={loggingIn}
                />
                {loginMessage && !showNotRegisteredInLogin && (
                  <div className={`mb-4 p-3 rounded text-sm ${loginMessage.includes('sent') || loginMessage.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {loginMessage}
                  </div>
                )}
                
                {/* Show "Register First" button if email not registered */}
                {showNotRegisteredInLogin && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 mb-3">
                      This email is not registered yet. Please register first to continue.
                    </p>
                  </div>
                )}

                {isUnverified && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={registering}
                      className="w-full bg-theme-blue text-white px-4 py-2 rounded-lg hover:brightness-95 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
                    >
                      {registering ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                )}

                {showNotRegisteredInLogin ? (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                        setShowNotRegisteredInLogin(false);
                        setLoginMessage('');
                      }}
                      className="flex-1 bg-theme-green text-white px-4 py-2 rounded-lg hover:brightness-95 transition font-semibold"
                    >
                      Register First
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        setEmailInput('');
                        setLoginMessage('');
                        setIsUnverified(false);
                        setShowNotRegisteredInLogin(false);
                      }}
                      className="flex-1 bg-gray-100 text-theme-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loggingIn}
                        className="flex-1 bg-theme-blue text-white px-4 py-2 rounded-lg hover:brightness-95 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {loggingIn ? 'Sending...' : 'Send Login Link'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoginModal(false);
                          setEmailInput('');
                          setLoginMessage('');
                          setIsUnverified(false);
                          setShowNotRegisteredInLogin(false);
                        }}
                        className="flex-1 bg-gray-100 text-theme-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoginModal(false);
                          setShowRegisterModal(true);
                          setIsUnverified(false);
                          setShowNotRegisteredInLogin(false);
                        }}
                        className="text-sm font-semibold text-theme-blue hover:text-theme-green transition-colors"
                      >
                        Not registered? Register here
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>
        )}

        {/* Registration Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-lift border border-gray-100 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">
                {isUnverified ? 'Resend Verification Email' : 'Register to Apply'}
              </h2>
              <p className="text-gray-600 mb-4">
                {isUnverified 
                  ? 'Your email is registered but not verified. Please check your inbox for the verification email, or click the button below to resend it.'
                  : 'Enter your email address to register. We\'ll send you a verification email to complete your registration.'}
              </p>
              <form onSubmit={handleRegister}>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setRegisterMessage('');
                  }}
                  placeholder="your.email@example.com"
                  className="w-full border border-gray-200 rounded-lg px-4 py-3 mb-4 focus:outline-none focus:ring-2 focus:ring-theme-green/30 focus:border-theme-green"
                  required
                  autoFocus
                  disabled={registering}
                />
                {registerMessage && (
                  <div className={`mb-4 p-3 rounded text-sm ${registerMessage.includes('sent') || registerMessage.includes('resent') || registerMessage.includes('verified') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {registerMessage}
                  </div>
                )}
                <div className="flex gap-3">
                  {isUnverified ? (
                    <>
                      <button
                        type="button"
                        onClick={handleResendVerification}
                        disabled={registering}
                        className="flex-1 bg-theme-blue text-white px-4 py-2 rounded-lg hover:brightness-95 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {registering ? 'Sending...' : 'Resend Verification Email'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegisterModal(false);
                          setEmailInput('');
                          setRegisterMessage('');
                          setIsUnverified(false);
                        }}
                        className="flex-1 bg-gray-100 text-theme-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={registering}
                        className="flex-1 bg-theme-green text-white px-4 py-2 rounded-lg hover:brightness-95 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                      >
                        {registering ? 'Sending...' : 'Register'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowRegisterModal(false);
                          setEmailInput('');
                          setRegisterMessage('');
                          setIsUnverified(false);
                        }}
                        className="flex-1 bg-gray-100 text-theme-dark px-4 py-2 rounded-lg hover:bg-gray-200 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegisterModal(false);
                      setShowLoginModal(true);
                      setIsUnverified(false);
                    }}
                    className="text-sm font-semibold text-theme-blue hover:text-theme-green transition-colors"
                  >
                    Already registered? Login here
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Already Applied Modal */}
        {showAlreadyAppliedModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-lift border border-gray-100 max-h-[90vh] overflow-y-auto">
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-yellow-600 mb-2">Already Applied</h2>
              <p className="text-gray-600 mb-4">
                You have already applied for this job position.
              </p>
              <button
                onClick={() => {
                  setShowAlreadyAppliedModal(false);
                }}
                className="bg-theme-blue text-white px-6 py-2 rounded-lg hover:brightness-95 transition font-semibold"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <div className="max-w-6xl mx-auto">
          {jobs.length === 0 ? (
            <div className="bg-white border border-gray-100 p-10 rounded-2xl shadow-soft text-center">
              <p className="text-xl font-semibold text-theme-dark">No positions available currently.</p>
              <p className="text-gray-600 mt-2">Please check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 gap-7">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    className="group relative w-full bg-white border border-gray-100 rounded-2xl shadow-soft hover:shadow-lift transition-shadow"
                  >
                    <div className="p-7">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="text-xs tracking-[0.25em] uppercase text-theme-dark/50 font-semibold">
                            Open Position
                          </div>
                          <h2 className="mt-3 text-xl font-extrabold text-theme-dark leading-snug">
                            {job.title}
                          </h2>
                        </div>
                        {isAuthenticated && hasProfile && (
                          appliedJobIds.has(job._id) ? (
                            <button
                              disabled
                              className="bg-yellow-100 text-yellow-700 cursor-default border border-yellow-200 px-6 py-3 rounded-lg font-semibold flex-shrink-0"
                            >
                              Already Applied
                            </button>
                          ) : (
                            <button
                              onClick={() => handleApply(job._id)}
                              className="btn-primary rounded-lg flex-shrink-0"
                            >
                              Apply Now
                            </button>
                          )
                        )}
                      </div>
                      <p className="text-gray-600 leading-relaxed">
                        {job.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        </div>
        </section>
      </div>
    </>
  );
};

export default Careers;
