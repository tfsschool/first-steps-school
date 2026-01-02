import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const LoginVerify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const { login, checkAuth } = useAuth();

  useEffect(() => {
    const verifyLogin = async () => {
      console.log('[LoginVerify] Starting verification', { token: !!token, email });
      
      if (!token || !email) {
        console.log('[LoginVerify] Missing token or email');
        setStatus('error');
        setMessage('Invalid login link');
        return;
      }

      // First, check if user is already authenticated (before trying to verify token)
      // Get token from localStorage and include in headers
      const tokenFromStorage = localStorage.getItem('token');
      const authConfig = tokenFromStorage ? { headers: { 'x-auth-token': tokenFromStorage } } : {};
      try {
        const authCheck = await axios.get(API_ENDPOINTS.CANDIDATE.CHECK_AUTH, authConfig);
        
        if (authCheck.data.authenticated && authCheck.data.email && 
            authCheck.data.email.toLowerCase() === email.toLowerCase()) {
          // User is already logged in, sync state and redirect
          console.log('[LoginVerify] User already authenticated, syncing state');
          
          // IMPORTANT: Update React state to match backend authentication
          if (tokenFromStorage) {
            login(tokenFromStorage, authCheck.data.email);
            console.log('[LoginVerify] ✅ State synchronized with existing token');
          }
          
          setStatus('success');
          setMessage('You are already logged in! Redirecting...');
          setTimeout(() => {
            navigate('/careers');
          }, 1000);
          return;
        }
      } catch (authErr) {
        // Not authenticated, continue with token verification
      }

      // User is not authenticated, verify the login token
      try {
        // Cookies are automatically sent via axios defaults
        // Include auth headers if token exists in storage
        const res = await axios.get(API_ENDPOINTS.CANDIDATE.VERIFY_LOGIN(token, email), authConfig);
        
        console.log('[LoginVerify] Verification successful', { hasToken: !!res.data.token, hasEmail: !!res.data.email });
        setStatus('success');
        setMessage(res.data.msg || 'Login successful!');
        
        // Use login() helper to set token and update state
        if (res.data.token && res.data.email) {
          console.log('[LoginVerify] ✅ Calling login() with token and email');
          login(res.data.token, res.data.email);
          console.log('[LoginVerify] ✅ Token saved to localStorage successfully');
        } else if (res.data.token) {
          console.log('[LoginVerify] ✅ Calling login() with token only');
          login(res.data.token, email);
          console.log('[LoginVerify] ✅ Token saved to localStorage successfully');
        } else {
          console.log('[LoginVerify] ⚠️ No token in response, calling checkAuth()');
          // Fallback: refresh auth status
          await checkAuth();
        }

        console.log('[LoginVerify] 🔄 Redirecting to /careers in 2 seconds');
        // Redirect to careers after 2 seconds
        setTimeout(() => {
          navigate('/careers');
        }, 2000);
      } catch (err) {
        // If token verification fails, check authentication status again
        // (The backend might have set the cookie even if token was already used)
        try {
          const finalAuthCheck = await axios.get(API_ENDPOINTS.CANDIDATE.CHECK_AUTH, authConfig);
          
          if (finalAuthCheck.data.authenticated && finalAuthCheck.data.email && 
              finalAuthCheck.data.email.toLowerCase() === email.toLowerCase()) {
            // User is authenticated (backend handled it), show success and redirect
            console.log('[LoginVerify] Final auth check successful');
            setStatus('success');
            setMessage('Login successful! Redirecting...');
            if (finalAuthCheck.data.token) {
              console.log('[LoginVerify] Calling login() from final check');
              login(finalAuthCheck.data.token, finalAuthCheck.data.email);
            }
            setTimeout(() => {
              navigate('/careers');
            }, 1500);
            return;
          }
        } catch (checkErr) {
          // Authentication check failed, continue to show error
        }
        
        // Only show error if user is truly not authenticated
        console.log('[LoginVerify] Verification failed', { status: err.response?.status, msg: err.response?.data?.msg });
        setStatus('error');
        setMessage(err.response?.data?.msg || 'Login verification failed. Please try again.');
      }
    };

    verifyLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, email]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Verifying Login...</h1>
            <p className="text-gray-600">Please wait while we verify your login link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">Login Successful!</h1>
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
            <h1 className="text-2xl font-bold text-red-600 mb-2">Login Failed</h1>
            <p className="text-gray-600 mb-4">{message}</p>
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

export default LoginVerify;

