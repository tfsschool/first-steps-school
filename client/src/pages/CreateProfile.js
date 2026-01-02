import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../config/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const CreateProfile = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobIdParam = searchParams.get('jobId');
  const { isAuthenticated, userEmail, loading: authLoading } = useAuth();

  const formatCnic = (value) => {
    const digitsOnly = String(value || '').replace(/[^\d]/g, '').slice(0, 13);
    if (digitsOnly.length !== 13) return String(value || '');
    return `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
  };

  const renderSinglePageForm = () => (
    <div className="space-y-10">
      {renderStep1()}
      {renderStep2()}
      {renderStep3()}
      {renderStep4()}
      {renderStep5()}
    </div>
  );
  
  const [formData, setFormData] = useState({
    // Personal Information
    profilePicture: null,
    fullName: '',
    dateOfBirth: '',
    gender: '',
    cnic: '',
    phone: '',
    email: userEmail || '',
    address: '',
    
    // Education
    education: [],
    
    // Work Experience
    workExperience: [],
    
    // Skills
    skills: [],
    skillInput: '',
    
    // Certifications
    certifications: [],
    
    // Resume
    resume: null
  });

  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState({
    profilePicture: null,
    resume: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  
  // Use ref to access latest formData in auto-save without causing re-renders
  const formDataRef = useRef(formData);
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load existing profile and check authentication on mount
  useEffect(() => {
    const loadProfile = async () => {
      // Wait for auth to load
      if (authLoading) {
        return;
      }

      // Check authentication
      if (!isAuthenticated || !userEmail) {
        setPopupMessage('Please login first to access your profile.');
        setShowErrorPopup(true);
        setTimeout(() => {
          navigate('/careers');
        }, 2000);
        setLoadingProfile(false);
        return;
      }

      // Update formData email with authenticated email
      setFormData(prev => ({ ...prev, email: userEmail }));

      try {
        // Try to fetch existing profile (using authenticated endpoint)
        try {
          const profileRes = await axios.get(API_ENDPOINTS.PROFILE.GET, {
            withCredentials: true
          });
          
          // 1. HANDLE LOCKED STATE
          if (profileRes.data.isLocked) {
            setIsLocked(true);
          }

          const existingProfile = profileRes.data;
          
          // Pre-populate form with existing profile data
          setFormData({
            profilePicture: null, // File object, not path
            fullName: existingProfile.fullName || '',
            dateOfBirth: existingProfile.dateOfBirth || '',
            gender: existingProfile.gender || '',
            cnic: formatCnic(existingProfile.cnic || ''),
            phone: existingProfile.phone || '',
            email: existingProfile.email || userEmail,
            address: existingProfile.address || '',
            education: existingProfile.education && existingProfile.education.length > 0 
              ? existingProfile.education 
              : [],
            workExperience: existingProfile.workExperience && existingProfile.workExperience.length > 0
              ? existingProfile.workExperience
              : [],
            skills: existingProfile.skills && existingProfile.skills.length > 0
              ? existingProfile.skills
              : [],
            skillInput: '',
            certifications: existingProfile.certifications && existingProfile.certifications.length > 0
              ? existingProfile.certifications
              : [],
            resume: null // File object, not path
          });

          // Set preview for existing files (handle both string and object format)
          if (existingProfile.profilePicture) {
            let profilePictureUrl;
            if (existingProfile.profilePicture && typeof existingProfile.profilePicture === 'object' && existingProfile.profilePicture !== null) {
              profilePictureUrl = existingProfile.profilePicture.preview_url || existingProfile.profilePicture.secure_url || '';
            } else if (typeof existingProfile.profilePicture === 'string') {
              if (existingProfile.profilePicture.startsWith('http://') || existingProfile.profilePicture.startsWith('https://')) {
                profilePictureUrl = existingProfile.profilePicture;
              } else {
                profilePictureUrl = `${API_ENDPOINTS.UPLOADS.BASE}/${existingProfile.profilePicture.replace(/^uploads\//, '')}`;
              }
            } else {
              profilePictureUrl = '';
            }
            if (profilePictureUrl) {
              setPreview(prev => ({
                ...prev,
                profilePicture: profilePictureUrl
              }));
            }
          }
          
          // 2. FIX RESUME NAME DISPLAY
          if (existingProfile.resumePath) {
            let resumeName = 'Saved Resume.pdf';
            
            // Try to extract a real filename if available
            if (typeof existingProfile.resumePath === 'object' && existingProfile.resumePath?.original_filename) {
               resumeName = `${existingProfile.resumePath.original_filename}.${existingProfile.resumePath.format || 'pdf'}`;
            } else if (typeof existingProfile.resumePath === 'string') {
               try {
                  resumeName = decodeURIComponent(existingProfile.resumePath.split('/').pop());
                  // Optional: remove timestamp prefix if your uploader adds one
                  // resumeName = resumeName.replace(/^\d+_/, ''); 
               } catch (e) {
                  // fallback to default
               }
            }

            setPreview(prev => ({
              ...prev,
              resume: resumeName
            }));
          }

          setProfileLoaded(true);
        } catch (profileErr) {
          // Profile doesn't exist yet, that's okay - user will create new one
          setProfileLoaded(false);
        }
      } catch (err) {
        // If check fails, allow to continue (might be creating profile after registration)
        setProfileLoaded(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  // Auto-save function (saves progress without full validation)
  const autoSave = useCallback(async (showNotification = false) => {
    if (isLocked) return; // Don't save if locked
    
    // Don't save if not authenticated
    if (!isAuthenticated || !userEmail) {
      return;
    }

    // Get latest formData from ref
    const currentFormData = formDataRef.current;

    // Don't save if no meaningful data entered yet
    if (!currentFormData.fullName && !currentFormData.email && !currentFormData.phone) {
      return;
    }

    setSaving(true);
    try {
      const submitData = new FormData();
      
      // Add files only if they exist
      if (currentFormData.profilePicture) {
        submitData.append('profilePicture', currentFormData.profilePicture);
      }
      if (currentFormData.resume) {
        submitData.append('resume', currentFormData.resume);
      }
      
      // Filter out empty entries before sending
      const filteredEducation = currentFormData.education.filter(edu => 
        edu.degree && edu.degree.trim() && 
        edu.institution && edu.institution.trim()
      );
      
      const filteredWorkExperience = currentFormData.workExperience.filter(exp => 
        exp.companyName && exp.companyName.trim() && 
        exp.jobTitle && exp.jobTitle.trim()
      );
      
      const filteredCertifications = currentFormData.certifications.filter(cert => 
        cert.name && cert.name.trim()
      );
      
      // Add form data as JSON (allow partial data)
      const profileData = {
        fullName: currentFormData.fullName || '',
        dateOfBirth: currentFormData.dateOfBirth || '',
        gender: currentFormData.gender || '',
        cnic: currentFormData.cnic ? currentFormData.cnic.replace(/[-\s]/g, '') : '',
        phone: currentFormData.phone || '',
        email: userEmail,
        address: currentFormData.address || '',
        education: filteredEducation,
        workExperience: filteredWorkExperience,
        skills: currentFormData.skills.filter(s => s && s.trim()),
        certifications: filteredCertifications
      };
      
      submitData.append('profileData', JSON.stringify(profileData));
      
      await axios.post(API_ENDPOINTS.PROFILE.CREATE_UPDATE, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      
      setLastSaved(new Date());
      if (showNotification) {
        setPopupMessage('Progress saved!');
        setShowSuccessPopup(true);
        setTimeout(() => setShowSuccessPopup(false), 1500);
      }
    } catch (err) {
      // Silently fail for auto-save (don't interrupt user flow)
      console.error('Auto-save error:', err);
    } finally {
      setSaving(false);
    }
  }, [isAuthenticated, userEmail, isLocked]);

  // Auto-save on form data changes (debounced)
  useEffect(() => {
    // Only auto-save if profile has been loaded and user has entered some data
    if (!profileLoaded || !isAuthenticated || !userEmail) {
      return;
    }

    // Don't auto-save if no meaningful data
    if (!formData.fullName && !formData.phone) {
      return;
    }

    // Debounce auto-save - save 3 seconds after user stops typing
    const timer = setTimeout(() => {
      autoSave(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [formData, profileLoaded, isAuthenticated, userEmail, autoSave]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      if (name === 'profilePicture') {
        setFormData({ ...formData, profilePicture: files[0] });
        if (files[0]) {
          const reader = new FileReader();
          reader.onloadend = () => {
            setPreview({ ...preview, profilePicture: reader.result });
          };
          reader.readAsDataURL(files[0]);
        }
      } else if (name === 'resume') {
        setFormData({ ...formData, resume: files[0] });
        if (files[0]) {
          setPreview({ ...preview, resume: files[0].name });
        }
      }
    } else if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Add education entry
  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, {
        degree: '',
        institution: '',
        yearOfCompletion: '',
        grade: ''
      }]
    });
  };

  // Remove education entry
  const removeEducation = (index) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    });
  };

  // Update education entry
  const updateEducation = (index, field, value) => {
    const updated = [...formData.education];
    updated[index][field] = value;
    setFormData({ ...formData, education: updated });
  };

  // Add work experience
  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [...formData.workExperience, {
        companyName: '',
        jobTitle: '',
        startDate: '',
        endDate: '',
        responsibilities: '',
        isCurrentJob: false
      }]
    });
  };

  // Remove work experience
  const removeWorkExperience = (index) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.filter((_, i) => i !== index)
    });
  };

  // Update work experience
  const updateWorkExperience = (index, field, value) => {
    const updated = [...formData.workExperience];
    updated[index][field] = value;
    setFormData({ ...formData, workExperience: updated });
  };

  // Add skill
  const addSkill = () => {
    if (formData.skillInput.trim()) {
      setFormData({
        ...formData,
        skills: [...formData.skills, formData.skillInput.trim()],
        skillInput: ''
      });
    }
  };

  // Remove skill
  const removeSkill = (index) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index)
    });
  };

  // Add certification
  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [...formData.certifications, {
        name: '',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        credentialId: '',
        credentialUrl: ''
      }]
    });
  };

  // Remove certification
  const removeCertification = (index) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index)
    });
  };

  // Update certification
  const updateCertification = (index, field, value) => {
    const updated = [...formData.certifications];
    updated[index][field] = value;
    setFormData({ ...formData, certifications: updated });
  };

  const getMissingRequiredFields = () => {
    const missing = [];

    if (!formData.fullName.trim()) missing.push('Full Name');
    if (!formData.dateOfBirth) missing.push('Date of Birth');
    if (!formData.gender) missing.push('Gender');
    if (!formData.cnic.trim()) {
      missing.push('CNIC');
    } else {
      const cleanedCnic = formData.cnic.replace(/[-\s]/g, '');
      if (!/^\d{13}$/.test(cleanedCnic)) missing.push('CNIC (must be 13 digits)');
    }
    if (!formData.phone.trim()) missing.push('Cell Number');
    if (!formData.email.trim()) missing.push('Email');
    if (!formData.address.trim()) missing.push('Address');

    if (formData.education.length === 0) {
      missing.push('Education (at least one entry)');
    } else {
      formData.education.forEach((edu, index) => {
        const row = index + 1;
        if (!edu.degree.trim()) missing.push(`Education #${row}: Degree`);
        if (!edu.institution.trim()) missing.push(`Education #${row}: Institution`);
        if (!edu.yearOfCompletion.trim()) missing.push(`Education #${row}: Year`);
      });
    }

    if (!formData.resume) missing.push('Resume');

    return missing;
  };

  // Submit form
  const handleSubmit = async () => {
    const missing = getMissingRequiredFields();

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
      sections.push('Missing required fields:');
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

    // Check authentication
    if (!isAuthenticated || !userEmail) {
      setPopupMessage('Please login first to save your profile.');
      setShowErrorPopup(true);
      setTimeout(() => {
        navigate('/careers');
      }, 2000);
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      
      // Add files
      if (formData.profilePicture) {
        submitData.append('profilePicture', formData.profilePicture);
      }
      if (formData.resume) {
        submitData.append('resume', formData.resume);
      }
      
      // Filter out empty entries before sending
      const filteredEducation = formData.education.filter(edu => 
        edu.degree && edu.degree.trim() && 
        edu.institution && edu.institution.trim()
      );
      
      const filteredWorkExperience = formData.workExperience.filter(exp => 
        exp.companyName && exp.companyName.trim() && 
        exp.jobTitle && exp.jobTitle.trim()
      );
      
      const filteredCertifications = formData.certifications.filter(cert => 
        cert.name && cert.name.trim()
      );
      
      // Add form data as JSON
      const profileData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        cnic: formData.cnic.replace(/[-\s]/g, ''), // Remove dashes and spaces before sending
        phone: formData.phone,
        email: userEmail, // Use authenticated email
        address: formData.address,
        education: filteredEducation,
        workExperience: filteredWorkExperience,
        skills: formData.skills.filter(s => s && s.trim()),
        certifications: filteredCertifications
      };
      
      submitData.append('profileData', JSON.stringify(profileData));
      
      await axios.post(API_ENDPOINTS.PROFILE.CREATE_UPDATE, submitData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });

      if (missing.length > 0) {
        setPopupMessage(`Profile saved, but it is incomplete.\n\n${formatMissingFieldsMessage(missing)}`);
      } else {
        setPopupMessage('Profile saved successfully!');
      }
      setShowSuccessPopup(true);
      
      // Redirect to apply page if jobId was provided, otherwise to careers
      setTimeout(() => {
        setShowSuccessPopup(false);
        if (jobIdParam) {
          navigate(`/apply/${jobIdParam}`);
        } else {
          navigate('/careers');
        }
      }, 2000);
    } catch (err) {
      setPopupMessage('Error saving profile: ' + (err.response?.data?.msg || err.message));
      setShowErrorPopup(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Step 1: Personal Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Personal Information</h2>
      
      <div>
        <label className="block text-sm font-semibold mb-2">Profile Picture</label>
        <input
          type="file"
          name="profilePicture"
          accept="image/*"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        {preview.profilePicture && (
          <img src={preview.profilePicture} alt="Profile" className="mt-2 w-32 h-32 object-cover rounded" />
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Full Name (as mentioned in CNIC) *</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-2">Date of Birth *</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Gender *</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">CNIC / National ID * (13 digits)</label>
        <input
          type="text"
          name="cnic"
          value={formData.cnic}
          onChange={(e) => {
            const digitsOnly = e.target.value.replace(/[^\d]/g, '').slice(0, 13);
            let formatted = digitsOnly;
            if (digitsOnly.length > 5) {
              formatted = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5)}`;
            }
            if (digitsOnly.length > 12) {
              formatted = `${digitsOnly.slice(0, 5)}-${digitsOnly.slice(5, 12)}-${digitsOnly.slice(12)}`;
            }
            setFormData({ ...formData, cnic: formatted });
            if (errors.cnic) {
              setErrors({ ...errors, cnic: '' });
            }
          }}
          className="w-full border p-2 rounded"
          placeholder="12345-1234567-1"
          required
        />
        {errors.cnic && <p className="text-red-500 text-sm mt-1">{errors.cnic}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Cell Number *</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          placeholder="03321234567"
          required
        />
        {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
          required
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold mb-2">Address *</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="3"
          className="w-full border p-2 rounded"
          required
        />
        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
      </div>
    </div>
  );

  // Step 2: Education
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Education Details</h2>
      </div>

      {formData.education.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No education added yet.</p>
          <button
            type="button"
            onClick={addEducation}
            className="bg-theme-blue text-white px-4 py-2 rounded text-sm font-semibold hover:brightness-95 transition"
          >
            + Add Education
          </button>
        </div>
      ) : null}

      {formData.education.map((edu, index) => (
        <div key={index} className="border p-4 rounded space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Education {index + 1}</h3>
            {formData.education.length > 1 && (
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                placeholder="e.g., FSC, Bachelor, Master"
                className="w-full border p-2 rounded"
                required
              />
              {errors[`education_${index}_degree`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`education_${index}_degree`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Institution *</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                className="w-full border p-2 rounded"
                required
              />
              {errors[`education_${index}_institution`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`education_${index}_institution`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Year of Completion *</label>
              <input
                type="text"
                value={edu.yearOfCompletion}
                onChange={(e) => updateEducation(index, 'yearOfCompletion', e.target.value)}
                placeholder="e.g., 2020"
                className="w-full border p-2 rounded"
                required
              />
              {errors[`education_${index}_year`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`education_${index}_year`]}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Grade / CGPA</label>
              <input
                type="text"
                value={edu.grade}
                onChange={(e) => updateEducation(index, 'grade', e.target.value)}
                placeholder="e.g., 3.5/4.0 or A"
                className="w-full border p-2 rounded"
              />
              {errors[`education_${index}_grade`] && (
                <p className="text-red-500 text-sm mt-1">{errors[`education_${index}_grade`]}</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {formData.education.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addEducation}
            className="bg-theme-blue text-white px-4 py-2 rounded text-sm font-semibold hover:brightness-95 transition"
          >
            + Add Another Education
          </button>
        </div>
      )}
    </div>
  );

  // Step 3: Work Experience
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Work Experience</h2>
          <p className="text-sm text-gray-600 mt-1">(Optional - You can skip this step if you don't have work experience)</p>
        </div>
      </div>

      {formData.workExperience.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No work experience added yet.</p>
          <button
            type="button"
            onClick={addWorkExperience}
            className="bg-theme-blue text-white px-4 py-2 rounded text-sm font-semibold hover:brightness-95 transition"
          >
            + Add Experience
          </button>
        </div>
      ) : (
        formData.workExperience.map((exp, index) => (
          <div key={index} className="border p-4 rounded space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Experience {index + 1}</h3>
              <button
                type="button"
                onClick={() => removeWorkExperience(index)}
                className="text-red-500 text-sm"
              >
                Remove
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Company/Organization Name *</label>
                <input
                  type="text"
                  value={exp.companyName}
                  onChange={(e) => updateWorkExperience(index, 'companyName', e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Company/Organization name"
                  required
                />
                {errors[`work_${index}_companyName`] && (
                  <p className="text-red-500 text-sm mt-1">{errors[`work_${index}_companyName`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Job Title</label>
                <input
                  type="text"
                  value={exp.jobTitle}
                  onChange={(e) => updateWorkExperience(index, 'jobTitle', e.target.value)}
                  className="w-full border p-2 rounded"
                  placeholder="Your job title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Start Date</label>
                <input
                  type="date"
                  value={exp.startDate}
                  onChange={(e) => updateWorkExperience(index, 'startDate', e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">End Date</label>
                <input
                  type="date"
                  value={exp.endDate}
                  onChange={(e) => updateWorkExperience(index, 'endDate', e.target.value)}
                  disabled={exp.isCurrentJob}
                  className="w-full border p-2 rounded"
                />
                <label className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    checked={exp.isCurrentJob}
                    onChange={(e) => updateWorkExperience(index, 'isCurrentJob', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Current Job</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Responsibilities</label>
              <textarea
                value={exp.responsibilities}
                onChange={(e) => updateWorkExperience(index, 'responsibilities', e.target.value)}
                rows="3"
                className="w-full border p-2 rounded"
                placeholder="Describe your key responsibilities and achievements"
              />
            </div>
          </div>
        ))
      )}

      {formData.workExperience.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={addWorkExperience}
            className="bg-theme-blue text-white px-4 py-2 rounded text-sm font-semibold hover:brightness-95 transition"
          >
            + Add Another Experience
          </button>
        </div>
      )}
    </div>
  );

  // Step 4: Skills & Certifications
  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Skills & Certifications</h2>
      <p className="text-sm text-gray-600 mb-4">(Optional - You can skip adding skills or certifications if you don't have any)</p>

      <div>
        <label className="block text-sm font-semibold mb-2">Skills</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={formData.skillInput}
            onChange={(e) => setFormData({ ...formData, skillInput: e.target.value })}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Enter a skill and press Enter"
            className="flex-1 border p-2 rounded"
          />
          <button
            type="button"
            onClick={addSkill}
            className="bg-theme-green text-white px-4 py-2 rounded font-semibold hover:brightness-95 transition"
          >
            Add
          </button>
        </div>
        {formData.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <span
                key={index}
                className="bg-theme-blue/10 text-theme-blue px-3 py-1 rounded-full flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(index)}
                  className="text-theme-blue hover:text-theme-green transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No skills added yet. Add skills to showcase your expertise.</p>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Certifications</h3>
        </div>

        {formData.certifications.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No certifications added yet.</p>
            <button
              type="button"
              onClick={addCertification}
              className="bg-theme-blue text-white px-4 py-2 rounded text-sm font-semibold hover:brightness-95 transition"
            >
              + Add Your First Certification
            </button>
          </div>
        ) : (
          <>
            {formData.certifications.map((cert, index) => (
              <div key={index} className="border p-4 rounded space-y-4 mb-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Certification {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeCertification(index)}
                    className="text-red-500 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder="Certification name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Issuing Organization</label>
                    <input
                      type="text"
                      value={cert.issuingOrganization}
                      onChange={(e) => updateCertification(index, 'issuingOrganization', e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder="Organization name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Issue Date</label>
                    <input
                      type="date"
                      value={cert.issueDate}
                      onChange={(e) => updateCertification(index, 'issueDate', e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={cert.expiryDate}
                      onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Credential ID</label>
                    <input
                      type="text"
                      value={cert.credentialId}
                      onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Credential URL</label>
                    <input
                      type="url"
                      value={cert.credentialUrl}
                      onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                      className="w-full border p-2 rounded"
                      placeholder="Optional verification URL"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={addCertification}
                className="bg-theme-blue text-white px-4 py-2 rounded text-sm font-semibold hover:brightness-95 transition"
              >
                + Add Another Certification
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Step 5: Resume Upload
  const renderStep5 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Resume / CV Upload</h2>
      
      <div>
        <label className="block text-sm font-semibold mb-2">Upload Resume (PDF/Doc) *</label>
        
        {/* DISPLAY SAVED RESUME NAME */}
        {preview.resume && !formData.resume && (
           <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <div>
                <p className="text-xs font-bold text-blue-800 uppercase tracking-wider">Current Resume</p>
                <p className="text-sm font-medium text-blue-900">{preview.resume}</p>
              </div>
           </div>
        )}

        <input
          type="file"
          name="resume"
          accept=".pdf,.doc,.docx"
          onChange={handleChange}
          disabled={isLocked}
          className="w-full border p-2 rounded disabled:bg-gray-100 disabled:cursor-not-allowed"
          // Only required if we don't have a saved one AND haven't picked a new one
          required={!preview.resume && !formData.resume}
        />
        
        {/* Show newly selected file name */}
        {formData.resume && (
          <p className="mt-2 text-sm text-green-600 font-medium">
             New file selected: {formData.resume.name}
          </p>
        )}
        
        {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
      </div>
    </div>
  );

  // Step 6: Summary
  const renderStep6 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Review Your Profile</h2>
      
      <div className="space-y-4">
        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Personal Information</h3>
          <p><strong>Name:</strong> {formData.fullName}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Cell Number:</strong> {formData.phone}</p>
          <p><strong>CNIC:</strong> {formatCnic(formData.cnic)}</p>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">
            Education (
            {
              formData.education.filter(
                (edu) =>
                  (edu?.degree && edu.degree.trim()) ||
                  (edu?.institution && edu.institution.trim()) ||
                  (edu?.yearOfCompletion && String(edu.yearOfCompletion).trim())
              ).length
            }
            )
          </h3>
          {formData.education.filter(
            (edu) =>
              (edu?.degree && edu.degree.trim()) ||
              (edu?.institution && edu.institution.trim()) ||
              (edu?.yearOfCompletion && String(edu.yearOfCompletion).trim())
          ).length === 0 ? (
            <p>No education added</p>
          ) : (
            formData.education
              .filter(
                (edu) =>
                  (edu?.degree && edu.degree.trim()) ||
                  (edu?.institution && edu.institution.trim()) ||
                  (edu?.yearOfCompletion && String(edu.yearOfCompletion).trim())
              )
              .map((edu, i) => (
                <p key={i}>
                  {edu.degree && edu.degree.trim() ? edu.degree : 'N/A'}
                  {edu.institution && edu.institution.trim() ? ` - ${edu.institution}` : ''}
                  {edu.yearOfCompletion && String(edu.yearOfCompletion).trim()
                    ? ` (${edu.yearOfCompletion})`
                    : ''}
                </p>
              ))
          )}
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Work Experience ({formData.workExperience.length})</h3>
          {formData.workExperience.length === 0 ? (
            <p>No work experience added</p>
          ) : (
            formData.workExperience
              .filter((exp) => (exp?.jobTitle && exp.jobTitle.trim()) || (exp?.companyName && exp.companyName.trim()))
              .map((exp, i) => (
                <p key={i}>
                  {exp.jobTitle && exp.jobTitle.trim() ? exp.jobTitle : 'N/A'}
                  {exp.companyName && exp.companyName.trim() ? ` at ${exp.companyName}` : ''}
                </p>
              ))
          )}
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-semibold mb-2">Skills ({formData.skills.length})</h3>
          <p>{formData.skills.join(', ')}</p>
        </div>
      </div>
    </div>
  );

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-2xl font-semibold text-gray-700">Loading your profile...</div>
          <p className="text-gray-500 mt-2">Please wait while we load your information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-soft border border-gray-100 p-6 sm:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {profileLoaded ? 'Edit Your Profile' : 'Create Your Profile'}
            </h1>
            {profileLoaded && (
              <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                ✓ Profile Found
              </span>
            )}
          </div>
          {profileLoaded && (
            <div className="bg-theme-blue/5 border border-theme-blue/15 rounded-lg p-4 mb-6">
              <p className="text-theme-blue text-sm">
                <strong>Your profile has been loaded.</strong> You can review and update your information, then click "Save Profile" to save changes.
              </p>
            </div>
          )}

          {/* ADD LOCK WARNING BANNER */}
          {isLocked && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-bold">Profile Locked:</span> You have already submitted an application. To ensure application integrity, your profile details cannot be changed.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={(e) => e.preventDefault()}>
            {/* WRAP THE FORM RENDER IN A DISABLED FIELDSET */}
            <fieldset disabled={isLocked} className={isLocked ? "opacity-75" : ""}>
               {renderSinglePageForm()}
            </fieldset>

            {/* Save Progress Indicator */}
            <div className="mt-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-theme-green"></div>
                    <span className="text-theme-blue">Saving progress...</span>
                  </>
                ) : lastSaved ? (
                  <span className="text-gray-500">
                    ✓ Saved {lastSaved.toLocaleTimeString()}
                  </span>
                ) : (
                  <span className="text-gray-400">Your progress will be saved automatically</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => autoSave(true)}
                disabled={saving || !isAuthenticated}
                className="text-theme-blue hover:text-theme-green text-sm font-semibold underline disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Saving...' : 'Save Progress'}
              </button>
            </div>

            {/* HIDE SAVE BUTTON IF LOCKED */}
            {!isLocked && (
              <div className="flex justify-end mt-8">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-theme-green text-white px-6 py-2 rounded-lg font-semibold hover:brightness-95 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lift border border-gray-100 p-8 max-w-md w-full mx-4 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Success!</h2>
            <div className="text-gray-600 mb-4 whitespace-pre-line">{popupMessage}</div>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lift border border-gray-100 p-8 max-w-md w-full mx-4 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error</h2>
            <div className="text-gray-600 mb-4 whitespace-pre-line text-left">{popupMessage}</div>
            <button
              onClick={() => {
                setShowErrorPopup(false);
                setPopupMessage('');
              }}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProfile;

