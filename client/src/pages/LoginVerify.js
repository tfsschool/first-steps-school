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
  const { login } = useAuth();

  useEffect(() => {
    const verifyLogin = async () => {
      if (!token || !email) {
        setStatus('error');
        setMessage('Invalid login link');
        return;
      }

      try {
        const res = await axios.get(API_ENDPOINTS.CANDIDATE.VERIFY_LOGIN(token, email));
        
        setStatus('success');
        setMessage(res.data.msg || 'Login successful!');
        
        // CRITICAL: Call login() to update AuthContext immediately
        if (res.data.token && res.data.email) {
          login(res.data.token, res.data.email);
        } else if (res.data.token) {
          login(res.data.token, email);
        }

        // Redirect
        setTimeout(() => {
          navigate('/careers');
        }, 1500);
      } catch (err) {
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

