import React from 'react';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
          <p className="text-gray-600 text-lg">
            Your application has been submitted successfully.
          </p>
        </div>
        
        <div className="bg-theme-blue/5 border border-theme-blue/15 rounded-lg p-4 mb-6">
          <p className="text-sm text-theme-blue">
            We have received your application and will review it shortly. You will be contacted if your profile matches our requirements.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/careers')}
            className="w-full bg-theme-green text-white py-3 rounded-lg font-semibold hover:brightness-95 transition"
          >
            Browse More Jobs
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;

