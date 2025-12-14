import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const Careers = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, userEmail, loading: authLoading, checkAuth, logout } = useAuth();
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
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

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.PUBLIC.JOBS);
        setJobs(res.data);
      } catch (err) {
        setError('Error loading job positions. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();

    // Check authentication status on mount
    if (!authLoading) {
      checkAuth();
    }

    // If coming from verification page, show success message
    if (searchParams.get('verified') === 'true') {
      setSearchParams({});
    }
  }, [authLoading, checkAuth, searchParams, setSearchParams]);

  if (loading || authLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-2xl font-semibold text-gray-700">Loading available positions...</div>
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
      setLoginMessage('Login link sent to your email! Please check your inbox and click the link to login. The link will expire in 15 minutes.');
      setIsUnverified(false);
    } catch (err) {
      if (err.response?.data?.notRegistered) {
        // Email not registered - show message with register button
        setShowNotRegisteredInLogin(true);
        setLoginMessage('This email is not registered yet.');
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

      setRegisterMessage('Verification email sent! Please check your inbox and click the verification link to complete your registration.');
      setIsUnverified(false);
      
      setTimeout(() => {
        setShowRegisterModal(false);
        setEmailInput('');
        setRegisterMessage('');
        setIsUnverified(false);
      }, 4000);
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
      
      // Check if profile is complete
      const isComplete = profile && 
        profile.fullName && profile.dateOfBirth && profile.gender && 
        profile.nationality && profile.cnic && profile.phone && 
        profile.email && profile.address && profile.resumePath &&
        profile.cnic.replace(/[-\s]/g, '').length === 13 &&
        profile.education && Array.isArray(profile.education) && profile.education.length > 0;
      
      if (isComplete) {
        // Profile is complete, navigate to apply page
        navigate(`/apply/${jobId}`);
      } else {
        // Profile is incomplete, show popup
        if (window.confirm('Your profile is incomplete. Please complete your profile before applying. Would you like to complete it now?')) {
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
        description="Explore exciting career opportunities at First Steps School. We're always looking for passionate educators and staff members to join our team."
        canonicalUrl="/careers"
      />
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-700 mb-2">Join Our Team</h1>
            <p className="text-gray-600">Explore exciting career opportunities at First Steps School</p>
          </div>
          <div className="flex gap-4">
            {isAuthenticated && userEmail && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as:</p>
                <p className="text-sm font-semibold">{userEmail}</p>
                <button
                  onClick={handleLogout}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                >
                  Logout
                </button>
              </div>
            )}
            <button
              onClick={handleCreateProfile}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              {isAuthenticated ? 'Update Profile' : 'Create Profile'}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Initial Choice Modal - "Have you already registered?" */}
        {showInitialModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
              <h2 className="text-2xl font-bold mb-4">Have you already registered?</h2>
              <p className="text-gray-600 mb-6">
                {pendingAction === 'apply' 
                  ? 'Please login or register to apply for this job position.'
                  : 'Please login or register to create your profile.'}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRegisteredYes}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  ✅ Yes, I'm registered
                </button>
                <button
                  onClick={handleRegisteredNo}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
                >
                  ➕ No, I'm new
                </button>
                <button
                  onClick={() => {
                    setShowInitialModal(false);
                    setPendingAction(null);
                  }}
                  className="w-full bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">Login</h2>
              <p className="text-gray-600 mb-4">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoFocus
                  disabled={loggingIn}
                />
                {loginMessage && (
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
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                        setShowNotRegisteredInLogin(false);
                        setLoginMessage('');
                      }}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                    >
                      Register First
                    </button>
                  </div>
                )}

                {isUnverified && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={registering}
                      className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                    >
                      {registering ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={loggingIn}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
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
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Not registered? Register here
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Registration Modal */}
        {showRegisterModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="submit"
                        disabled={registering}
                        className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
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
                        className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
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
                    className="text-sm text-blue-600 hover:text-blue-800"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
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
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                OK
              </button>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto grid gap-6">
          {jobs.length === 0 ? (
            <div className="bg-white border p-8 rounded-lg shadow text-center">
              <p className="text-xl text-gray-600">No positions available currently.</p>
              <p className="text-gray-500 mt-2">Please check back later for new opportunities.</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job._id} className="bg-white border p-6 rounded-lg shadow-sm hover:shadow-md transition">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h2>
                <p className="text-gray-600 my-4">{job.description}</p>
                <button
                  onClick={() => handleApply(job._id)}
                  className="inline-block bg-orange-500 text-white px-6 py-2 rounded mt-4 hover:bg-orange-600 transition font-semibold"
                >
                  Apply Now
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default Careers;
