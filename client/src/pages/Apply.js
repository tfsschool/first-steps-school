import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { showWarning } from '../utils/toast';

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
            showWarning('You have already applied for this job.');
            setTimeout(() => {
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
        setError('Resume not found in profile. Please edit your profile.');
        setSubmitting(false);
        return;
      }
    } else {
      setError('Resume not found in profile. Please edit your profile.');
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
      
      // If already applied, show warning and redirect
      if (errorMsg.includes('already applied')) {
        showWarning('You have already applied for this job.');
        setTimeout(() => {
          navigate('/careers');
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full border-2 border-theme-blue/20 border-t-theme-green animate-spin" />
          <div className="mt-4 text-lg font-semibold text-theme-dark">Loading...</div>
        </div>
      </div>
    );
  }

  if (error && !job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-6 sm:p-10 rounded-2xl shadow-soft border border-gray-100 max-w-md w-full">
          <div className="text-red-700 text-lg font-semibold mb-4">{error}</div>
          <button
            onClick={() => navigate('/careers')}
            className="bg-theme-blue text-white px-6 py-3 rounded-lg font-semibold hover:brightness-95 transition"
          >
            Back to Careers
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center bg-white p-6 sm:p-10 rounded-2xl shadow-soft border border-gray-100 max-w-md w-full">
          <div className="text-red-700 text-lg font-semibold mb-4">
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
        title={job ? `Apply for ${job.title} - The First Steps School` : 'Apply - The First Steps School'} 
        description={job ? `Apply for the ${job.title} position at The First Steps School. Join our team of passionate educators.` : 'Apply for a position at The First Steps School.'}
        canonicalUrl={`/apply/${jobId}`}
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
                Application
              </div>
              <h1 className="mt-3 text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                Job Application
              </h1>
              <p className="mt-4 text-white/85 text-base md:text-lg leading-relaxed">
                Position: <span className="font-semibold text-white">{job?.title}</span>
              </p>
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-soft border border-gray-100 p-8 md:p-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                  <div>
                    <div className="text-xs tracking-[0.25em] uppercase text-theme-dark/50 font-semibold">
                      Candidate Profile
                    </div>
                    <h2 className="mt-2 text-2xl font-extrabold text-theme-dark">Your Profile</h2>
                    <p className="mt-2 text-gray-600">
                      Your application will be submitted using your saved profile information.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/create-profile')}
                    className="bg-theme-blue text-white px-6 py-3 rounded-lg font-semibold hover:brightness-95 transition"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <div className="text-xs tracking-[0.22em] uppercase text-theme-dark/50 font-semibold">Name</div>
                    <div className="mt-2 font-semibold text-theme-dark">{profile.fullName}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <div className="text-xs tracking-[0.22em] uppercase text-theme-dark/50 font-semibold">Email</div>
                    <div className="mt-2 font-semibold text-theme-dark break-all">{profile.email}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <div className="text-xs tracking-[0.22em] uppercase text-theme-dark/50 font-semibold">Cell Number</div>
                    <div className="mt-2 font-semibold text-theme-dark">{profile.phone}</div>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <div className="text-xs tracking-[0.22em] uppercase text-theme-dark/50 font-semibold">Education / Experience</div>
                    <div className="mt-2 text-theme-dark">
                      <span className="font-semibold">{profile.education?.length || 0}</span> education entries
                      <span className="mx-2 text-gray-300">|</span>
                      <span className="font-semibold">{profile.workExperience?.length || 0}</span> experience entries
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-lg whitespace-pre-line">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-theme-green text-white py-3.5 rounded-lg font-semibold hover:brightness-95 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Thank You Popup */}
      {showThankYou && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lift p-8 max-w-md w-full mx-4 text-center border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your application has been submitted successfully. You will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-gray-500">Redirecting to thank you page...</p>
          </div>
        </div>
      )}
    </>
  );
};

export default Apply;
