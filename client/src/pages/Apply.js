import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';

const Apply = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to load
      if (authLoading) {
        return;
      }

      // Check authentication
      if (!isAuthenticated) {
        setError('Please login to apply for jobs. Redirecting...');
        setTimeout(() => navigate('/careers'), 2000);
        setLoading(false);
        return;
      }

      try {
        // Fetch job
        const jobRes = await axios.get(API_ENDPOINTS.PUBLIC.JOBS);
        const foundJob = jobRes.data.find(j => j._id === jobId);
        if (!foundJob) {
          setError('Job position not found.');
          setLoading(false);
          return;
        }
        if (foundJob.status !== 'Open') {
          setError('This position is no longer accepting applications.');
          setLoading(false);
          return;
        }
        setJob(foundJob);

        // Check if already applied (using authenticated endpoint)
        try {
          const checkAppRes = await axios.get(API_ENDPOINTS.APPLICATION.CHECK(jobId), {
            withCredentials: true
          });
          if (checkAppRes.data.applied) {
            setError('You have already applied for this job position.');
            setTimeout(() => {
              alert('You have already applied for this job.');
              navigate('/careers');
            }, 2000);
            setLoading(false);
            return;
          }
        } catch (checkErr) {
          // Continue if check fails
        }

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

        const formatMissingFieldsMessage = (items) => {
          const personal = [];
          const education = [];
          const resume = [];

          (items || []).forEach((item) => {
            if (item.startsWith('Education')) {
              education.push(item);
            } else if (item.toLowerCase().includes('resume')) {
              resume.push(item);
            } else {
              personal.push(item);
            }
          });

          const sections = [];
          sections.push('Please complete the following required fields before submitting your application:');
          if (personal.length > 0) {
            sections.push('\nPersonal Information');
            personal.forEach((f) => sections.push(`- ${f}`));
          }
          if (education.length > 0) {
            sections.push('\nEducation');
            education.forEach((f) => sections.push(`- ${f}`));
          }
          if (resume.length > 0) {
            sections.push('\nResume');
            resume.forEach((f) => sections.push(`- ${f}`));
          }
          return sections.join('\n');
        };

        // Fetch profile (using authenticated endpoint)
        try {
          const profileRes = await axios.get(API_ENDPOINTS.PROFILE.GET, {
            withCredentials: true
          });
          console.log('Profile fetched successfully:', profileRes.data);
          const fetchedProfile = profileRes.data;
          const missing = getMissingRequiredFields(fetchedProfile);
          if (missing.length > 0) {
            setError(formatMissingFieldsMessage(missing));
          }
          setProfile(fetchedProfile);
        } catch (profileErr) {
          console.error('Error fetching profile:', profileErr.response?.data || profileErr.message);
          // Profile not found, redirect to create profile
          if (window.confirm('You need to create a profile first. Would you like to create one now?')) {
            navigate('/create-profile');
          } else {
            navigate('/careers');
          }
          setLoading(false);
          return;
        }
      } catch (err) {
        setError('Error loading job details. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jobId, navigate, isAuthenticated, authLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!profile) {
      setError('Profile not found. Please create a profile first.');
      return;
    }

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

    const formatMissingFieldsMessage = (items) => {
      const personal = [];
      const education = [];
      const resume = [];

      (items || []).forEach((item) => {
        if (item.startsWith('Education')) {
          education.push(item);
        } else if (item.toLowerCase().includes('resume')) {
          resume.push(item);
        } else {
          personal.push(item);
        }
      });

      const sections = [];
      sections.push('Please complete the following required fields before submitting your application:');
      if (personal.length > 0) {
        sections.push('\nPersonal Information');
        personal.forEach((f) => sections.push(`- ${f}`));
      }
      if (education.length > 0) {
        sections.push('\nEducation');
        education.forEach((f) => sections.push(`- ${f}`));
      }
      if (resume.length > 0) {
        sections.push('\nResume');
        resume.forEach((f) => sections.push(`- ${f}`));
      }
      return sections.join('\n');
    };

    const missing = getMissingRequiredFields(profile);
    if (missing.length > 0) {
      setError(formatMissingFieldsMessage(missing));
      return;
    }

    setError('');
    setSubmitting(true);

    const data = new FormData();
    // Use profile data instead of form data
    data.append('fullName', profile.fullName);
    data.append('phone', profile.phone);
    data.append('education', JSON.stringify(profile.education || []));
    // Use profile's resume path (handle both string and object format)
    if (profile.resumePath) {
      const resumePath = typeof profile.resumePath === 'object' 
        ? profile.resumePath.secure_url || profile.resumePath.preview_url || profile.resumePath.download_url
        : profile.resumePath;
      if (resumePath) {
        data.append('cvPath', resumePath);
      } else {
        setError('Resume not found in profile. Please update your profile.');
        setSubmitting(false);
        return;
      }
    } else {
      setError('Resume not found in profile. Please update your profile.');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(API_ENDPOINTS.APPLICATION.APPLY(jobId), data, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      // Show thank you popup
      setShowThankYou(true);
      // Redirect to thank you page after 3 seconds
      setTimeout(() => {
        navigate('/thank-you');
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.msg || 'Error submitting application. Please try again.';
      setError(errorMsg);
      
      // If already applied, show alert and redirect
      if (errorMsg.includes('already applied')) {
        setTimeout(() => {
          alert('You have already applied for this job.');
          navigate('/careers');
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-2xl font-semibold text-gray-700">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-xl font-semibold mb-4">{error}</div>
          <button
            onClick={() => navigate('/careers')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Careers
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 text-xl font-semibold mb-4">
            {error || 'Loading profile...'}
          </div>
          {!error && <div className="text-gray-600">Please wait...</div>}
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title={job ? `Apply for ${job.title} - First Steps School` : 'Apply - First Steps School'} 
        description={job ? `Apply for the ${job.title} position at First Steps School. Join our team of passionate educators.` : 'Apply for a position at First Steps School.'}
        canonicalUrl={`/apply/${jobId}`}
      />
      <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Job Application</h2>
            <p className="text-gray-600">Position: <span className="font-semibold text-blue-600">{job?.title}</span></p>
          </div>

          {/* Profile Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 relative">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">Your Profile Information</h3>
              <button
                type="button"
                onClick={() => navigate('/create-profile')}
                className="bg-gray-500 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-600 transition"
              >
                Edit Profile
              </button>
            </div>
            <p><strong>Name:</strong> {profile.fullName}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Cell Number:</strong> {profile.phone}</p>
            <p><strong>Education:</strong> {profile.education?.length || 0} entries</p>
            <p><strong>Experience:</strong> {profile.workExperience?.length || 0} entries</p>
            <p className="text-sm text-gray-600 mt-2">
              Your application will be submitted using your profile information.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 whitespace-pre-line">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 p-4 rounded">
              <p className="text-sm text-gray-600 mb-4">
                Review your profile information above. Click submit to apply for this position using your profile.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>
        </div>
      </div>

      {/* Thank You Popup */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your application has been submitted successfully and sent to the admin. You will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500">Redirecting to thank you page...</p>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Apply;
