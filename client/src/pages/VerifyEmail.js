import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const { setAuthenticated } = useAuth();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      try {
        // Token is already decoded by useSearchParams, but we need to encode it for the API call
        // to handle any special characters properly
        const res = await axios.get(API_ENDPOINTS.CANDIDATE.VERIFY_EMAIL(token, email), {
          withCredentials: true // Important: Receive cookies
        });
        setStatus('success');
        setMessage(res.data.msg || (res.data.alreadyVerified ? 'Email is already verified. You have been logged in.' : 'Email verified successfully!'));
        
        // Update auth context (session is created automatically by backend via cookie)
        if (res.data.email) {
          setAuthenticated(true, res.data.email);
        }

        // Redirect to careers after 3 seconds
        setTimeout(() => {
          navigate('/careers?verified=true');
        }, 3000);
      } catch (err) {
        // Check if email is already verified
        if (err.response?.data?.alreadyVerified) {
          setStatus('success');
          setMessage('Your email is already verified. You have been logged in.');
          // Try to authenticate if possible
          if (email) {
            // Check auth status
            try {
              const authCheck = await axios.get(API_ENDPOINTS.CANDIDATE.CHECK_AUTH);
              if (authCheck.data.authenticated) {
                setAuthenticated(true, authCheck.data.email);
              }
            } catch (authErr) {
              // Not authenticated yet, but that's okay
            }
          }
          setTimeout(() => {
            navigate('/careers?verified=true');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(err.response?.data?.msg || 'Verification failed. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [token, email, navigate, setAuthenticated]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Email...</h1>
            <p className="text-gray-600">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Email Verified!</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-500">Redirecting to careers page...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Verification Failed</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            
            {email && (
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-3 bg-gray-50 text-gray-600"
                />
                <button
                  onClick={async () => {
                    setResending(true);
                    setResendMessage('');
                    try {
                      await axios.post(API_ENDPOINTS.CANDIDATE.REGISTER, {
                        email: email
                      });
                      setResendMessage('Verification email resent! Please check your inbox.');
                    } catch (err) {
                      setResendMessage(err.response?.data?.msg || 'Failed to resend verification email.');
                    } finally {
                      setResending(false);
                    }
                  }}
                  disabled={resending}
                  className="w-full bg-theme-blue text-white px-6 py-2 rounded-lg hover:brightness-95 transition font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {resending ? 'Sending...' : 'Resend Verification Email'}
                </button>
                {resendMessage && (
                  <p className={`mt-3 text-sm ${resendMessage.includes('resent') ? 'text-green-600' : 'text-red-600'}`}>
                    {resendMessage}
                  </p>
                )}
              </div>
            )}
            
            <button
              onClick={() => navigate('/careers')}
              className="bg-theme-green text-white px-6 py-2 rounded-lg hover:brightness-95 transition font-semibold"
            >
              Go to Careers
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

