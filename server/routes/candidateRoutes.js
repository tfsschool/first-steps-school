const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Candidate = require('../models/Candidate');
const UserProfile = require('../models/UserProfile');
const { sendEmail } = require('../config/email');
const { authenticate } = require('../middleware/auth');

// Helper function to get frontend URL with proper trailing slash handling
const getFrontendUrl = () => {
  // 1. Force custom domain in production if set, or fallback to tfs.school
  if (process.env.NODE_ENV === 'production') {
     // If FRONTEND_URL is the vercel default or missing, force tfs.school
     if (!process.env.FRONTEND_URL || process.env.FRONTEND_URL.includes('vercel.app')) {
        return 'https://tfs.school';
     }
  }
  
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  // Remove trailing slash to avoid double slashes
  return url.replace(/\/+$/, '');
};

// 1. Request Email Verification (Registration)
router.post('/register', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }

    // Check if candidate already exists
    let candidate = await Candidate.findOne({ email: email.toLowerCase().trim() });

    if (candidate && candidate.emailVerified) {
      return res.status(400).json({ 
        msg: 'This email is already registered. Please login or use a different email.',
        alreadyRegistered: true
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    if (candidate) {
      // Update existing candidate with new token
      candidate.verificationToken = verificationToken;
      candidate.verificationTokenExpiry = verificationTokenExpiry;
      await candidate.save();
    } else {
      // Create new candidate
      candidate = new Candidate({
        email: email.toLowerCase().trim(),
        verificationToken,
        verificationTokenExpiry
      });
      await candidate.save();
    }

    // Send verification email
    // Use the getFrontendUrl helper for consistency
    const baseURL = getFrontendUrl();
    
    // URL encode the token to handle special characters
    const verificationUrl = `${baseURL}/verify-email?token=${encodeURIComponent(verificationToken)}&email=${encodeURIComponent(email)}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Welcome to The First Steps School</h2>
        <p>Thank you for your interest in joining our team!</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Verify Email Address
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This verification link will expire in 24 hours.</p>
      </div>
    `;

    await sendEmail(
      email,
      'Verify Your Email - The First Steps School',
      emailHtml
    );

    res.json({ 
      msg: 'Verification email sent! Please check your inbox.',
      email: email
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// 2. Verify Email
router.get('/verify-email', async (req, res) => {
  try {
    let { token, email } = req.query;
    
    // Decode email if it's URL encoded
    if (email) {
      try {
        email = decodeURIComponent(email);
      } catch (e) {
        // If decoding fails, use original email
      }
    }

    if (!token) {
      return res.status(400).json({ msg: 'Invalid verification token' });
    }

    // Decode URL-encoded token (email links encode special characters)
    let cleanToken;
    try {
      cleanToken = decodeURIComponent(token).trim();
    } catch (e) {
      // If decoding fails, use original token
      cleanToken = token.trim();
    }

    // Try to find candidate with the token (exact match)
    // First, try to find by email if provided (to get the candidate record)
    let candidate = null;
    
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const candidateByEmail = await Candidate.findOne({ email: cleanEmail });
      
      if (candidateByEmail) {
        // Check if the token matches this candidate's token
        if (candidateByEmail.verificationToken) {
          // Try exact match first
          if (candidateByEmail.verificationToken === cleanToken || 
              candidateByEmail.verificationToken === token.trim()) {
            candidate = candidateByEmail;
          } else {
            // Try case-insensitive match
            if (candidateByEmail.verificationToken.toLowerCase() === cleanToken.toLowerCase()) {
              candidate = candidateByEmail;
            }
          }
        }
      }
    }
    
    // If not found by email+token, try direct token lookup
    if (!candidate) {
      candidate = await Candidate.findOne({
        verificationToken: cleanToken
      });
    }

    // If not found, try with original token (in case it wasn't URL encoded)
    if (!candidate) {
      candidate = await Candidate.findOne({
        verificationToken: token.trim()
      });
    }

    // If still not found, try case-insensitive search across all candidates
    if (!candidate) {
      const allCandidates = await Candidate.find({ 
        verificationToken: { $exists: true, $ne: null } 
      });
      for (let cand of allCandidates) {
        if (cand.verificationToken && cand.verificationToken.toLowerCase() === cleanToken.toLowerCase()) {
          candidate = cand;
          break;
        }
      }
    }

    // Check if token exists
    if (!candidate) {
      // Token not found - check if email is already verified
      // This handles the case where user clicks verification link after already verifying
      if (email) {
        const cleanEmail = email.toLowerCase().trim();
        const candidateByEmail = await Candidate.findOne({ 
          email: cleanEmail
        });
        
        if (candidateByEmail) {
          // IMPORTANT: Only log in if email is ALREADY verified
          // Do NOT verify the email here - that requires a valid token
          if (candidateByEmail.emailVerified) {
            // Create JWT token for session
            const authToken = jwt.sign(
              { candidateId: candidateByEmail._id, email: candidateByEmail.email },
              process.env.JWT_SECRET,
              { expiresIn: '7d' }
            );

            // Set HTTP-only cookie
            const options = {
              expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
              httpOnly: true,
              secure: true,        // REQUIRED: Must be true for Vercel/HTTPS
              sameSite: 'none'     // REQUIRED: Allows Frontend to talk to Backend
            };
            res.cookie('authToken', authToken, options);

            return res.json({
              msg: 'Email is already verified. You have been logged in.',
              email: candidateByEmail.email,
              emailVerified: true,
              alreadyVerified: true
            });
          }
        }
      }
      
      // If we have an email but couldn't verify, provide helpful message
      if (email) {
        const cleanEmail = email.toLowerCase().trim();
        const candidateCheck = await Candidate.findOne({ email: cleanEmail });
        if (candidateCheck && candidateCheck.emailVerified) {
          // Email is verified but token is invalid - user probably clicked old link
          return res.status(400).json({ 
            msg: 'This verification link has already been used. Your email is already verified. Please try logging in.',
            alreadyVerified: true
          });
        }
      }
      
      return res.status(400).json({ 
        msg: 'Invalid or expired verification token. Please request a new verification email.'
      });
    }

    // Check if token is expired
    if (candidate.verificationTokenExpiry) {
      const expiryDate = new Date(candidate.verificationTokenExpiry);
      const now = new Date();
      if (expiryDate < now) {
        return res.status(400).json({ 
          msg: 'Verification token has expired. Please request a new verification email.',
          expired: true
        });
      }
    }

    // Verify that we have a valid token match before proceeding
    const tokenMatches = candidate.verificationToken === cleanToken || 
                         candidate.verificationToken === token.trim() ||
                         candidate.verificationToken?.toLowerCase() === cleanToken.toLowerCase();
    
    if (!tokenMatches) {
      return res.status(400).json({ 
        msg: 'Invalid verification token. Please request a new verification email.'
      });
    }

    // Mark email as verified (CRITICAL: This must happen for valid tokens)
    candidate.emailVerified = true;
    candidate.verificationToken = null;
    candidate.verificationTokenExpiry = null;
    await candidate.save();

    // Create JWT token for session
    const authToken = jwt.sign(
      { candidateId: candidate._id, email: candidate.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Set HTTP-only cookie
    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: true,        // REQUIRED: Must be true for Vercel/HTTPS
      sameSite: 'none'     // REQUIRED: Allows Frontend to talk to Backend
    };
    res.cookie('authToken', authToken, options);

    // Send welcome email
    const frontendUrl = getFrontendUrl();
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Registration Successful!</h2>
        <p>Your email has been verified successfully.</p>
        <p>You can now login and start applying for jobs at The First Steps School.</p>
        <a href="${frontendUrl}/careers" 
           style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Click here to apply for jobs
        </a>
        <p>Thank you for joining The First Steps School!</p>
      </div>
    `;

    await sendEmail(
      candidate.email,
      'Registration Successful - The First Steps School',
      welcomeHtml
    );

    // Notify admin about verified registration
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
          <h2 style="color: #7c3aed; margin-bottom: 20px;">New Candidate Registered & Verified</h2>
          <p style="color: #374151; margin-bottom: 15px;">A new candidate has successfully registered and verified their email:</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Email:</strong> ${candidate.email}</p>
            <p style="margin: 5px 0;"><strong>Registration Date:</strong> ${new Date(candidate.registeredAt).toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Verification Date:</strong> ${new Date().toLocaleString()}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Email Verified ✓</span></p>
          </div>
          <p style="color: #6b7280; margin-bottom: 15px;">The candidate can now create their profile and apply for jobs.</p>
          <a href="${getFrontendUrl()}/admin/candidates?search=${candidate.email}" 
             style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
            View in Admin Dashboard
          </a>
        </div>
      `;

      await sendEmail(
        adminEmail,
        'New Candidate Registered & Verified - The First Steps School',
        adminHtml
      );
    }

    res.json({ 
      msg: 'Email verified successfully! You can now create your profile and apply for jobs.',
      email: candidate.email,
      emailVerified: true,
      authenticated: true
    });
  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// 3. Check if candidate is registered
// 3. Check if Candidate is Registered/Verified
router.get('/check/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const candidate = await Candidate.findOne({ email });

    if (!candidate) {
      return res.json({ 
        registered: false,
        verified: false,
        candidate: null
      });
    }

    res.json({ 
      registered: true,
      verified: candidate.emailVerified || false,
      candidate: candidate || null
    });
  } catch (err) {
    console.error('Check candidate error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// 4. Passwordless Login - Request Login Link
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({ msg: 'Please provide a valid email address' });
    }

    const candidate = await Candidate.findOne({ 
      email: email.toLowerCase().trim()
    });

    if (!candidate) {
      return res.status(400).json({ 
        msg: 'Email not registered. Please register to apply for jobs.',
        notRegistered: true
      });
    }

    if (!candidate.emailVerified) {
      return res.status(400).json({ 
        msg: 'Email not verified. Please check your inbox and verify your email first.',
        notVerified: true,
        email: candidate.email
      });
    }

    // Generate one-time login token
    const loginToken = crypto.randomBytes(32).toString('hex');
    const loginTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store login token in candidate document
    candidate.loginToken = loginToken;
    candidate.loginTokenExpiry = loginTokenExpiry;
    await candidate.save();

    // Send login link email
    const frontendUrl = getFrontendUrl();
    const loginUrl = `${frontendUrl}/login-verify?token=${encodeURIComponent(loginToken)}&email=${encodeURIComponent(email)}`;
    
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Login to The First Steps School</h2>
        <p>Click the link below to securely login to your account:</p>
        <a href="${loginUrl}" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
          Login to Your Account
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${loginUrl}</p>
        <p>This login link will expire in 15 minutes.</p>
      </div>
    `;

    await sendEmail(
      email,
      'Login Link - The First Steps School',
      emailHtml
    );

    res.json({ 
      msg: 'Login link sent to your email! Please check your inbox and click the link to login.',
      email: email
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// 5. Verify Login Token (Magic Link)
router.get('/verify-login', async (req, res) => {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({ msg: 'Invalid login link' });
    }

    // Decode URL-encoded token
    let cleanToken;
    try {
      cleanToken = decodeURIComponent(token).trim();
    } catch (e) {
      cleanToken = token.trim();
    }

    // First find candidate by email
    const candidate = await Candidate.findOne({ 
      email: email.toLowerCase().trim()
    });

    if (!candidate) {
      return res.status(400).json({ 
        msg: 'Invalid login link. Email not found.',
        expired: true
      });
    }

    // Check if token matches (if token exists, it means it hasn't been used yet)
    if (!candidate.loginToken || candidate.loginToken !== cleanToken) {
      // Token doesn't match or has been used - check if user is already authenticated
      // This handles the case where user clicks the link twice
      if (candidate.emailVerified) {
        // User is verified, token was already used - check if they're already logged in
        const existingToken = req.cookies?.authToken;
        if (existingToken) {
          try {
            const decoded = jwt.verify(existingToken, process.env.JWT_SECRET);
            if (decoded.candidateId && decoded.candidateId.toString() === candidate._id.toString()) {
              // User is already authenticated, return success (200) instead of error
              return res.json({ 
                msg: 'You are already logged in!',
                email: candidate.email,
                authenticated: true,
                token: existingToken,
                alreadyLoggedIn: true
              });
            }
          } catch (e) {
            // Token invalid, continue with normal flow
          }
        }
        
        // User is verified but not authenticated - create a new session for them
        // (Token was used but they might have logged out or session expired)
        const authToken = jwt.sign(
          { candidateId: candidate._id, email: candidate.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );

        const options = {
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          httpOnly: true,
          secure: true,        // REQUIRED: Must be true for Vercel/HTTPS
          sameSite: 'none'     // REQUIRED: Allows Frontend to talk to Backend
        };
        res.cookie('authToken', authToken, options);

        return res.json({ 
          msg: 'Login successful!',
          email: candidate.email,
          authenticated: true,
          token: authToken,
          tokenReused: true
        });
      }
      
      // User not verified or no valid session - return error
      return res.status(400).json({ 
        msg: 'This login link has already been used or is invalid. Please request a new login link.',
        expired: true,
        alreadyUsed: true
      });
    }

    // Check if token is expired
    if (candidate.loginTokenExpiry && new Date(candidate.loginTokenExpiry) < new Date()) {
      candidate.loginToken = null;
      candidate.loginTokenExpiry = null;
      await candidate.save();
      
      return res.status(400).json({ 
        msg: 'Login link has expired. Please request a new login link.',
        expired: true
      });
    }

    if (!candidate.emailVerified) {
      return res.status(403).json({ 
        msg: 'Email not verified. Please verify your email first.',
        notVerified: true
      });
    }

    // Clear login token (one-time use)
    candidate.loginToken = null;
    candidate.loginTokenExpiry = null;
    await candidate.save();

    // Create JWT token for session
    const authToken = jwt.sign(
      { candidateId: candidate._id, email: candidate.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Token expires in 7 days
    );

    // Set HTTP-only cookie
    const options = {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: true,        // REQUIRED: Must be true for Vercel/HTTPS
      sameSite: 'none'     // REQUIRED: Allows Frontend to talk to Backend
    };
    res.cookie('authToken', authToken, options);

    res.json({ 
      msg: 'Login successful!',
      email: candidate.email,
      authenticated: true,
      token: authToken
    });
  } catch (err) {
    console.error('Verify login error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// 6. Check Authentication Status
router.get('/check-auth', authenticate, async (req, res) => {
  try {
    // If middleware passes, user is authenticated
    const candidate = await Candidate.findById(req.candidate.id);
    
    res.json({
      authenticated: true,
      email: candidate.email,
      emailVerified: candidate.emailVerified,
      profileExists: !!candidate.profileId
    });
  } catch (err) {
    console.error('Check auth error:', err);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// 7. Logout
router.post('/logout', (req, res) => {
  // Clear HTTP-only cookie
  const options = {
    httpOnly: true,
    secure: true,        // REQUIRED: Must be true for Vercel/HTTPS
    sameSite: 'none'     // REQUIRED: Allows Frontend to talk to Backend
  };
  res.clearCookie('authToken', options);

  res.json({ 
    msg: 'Logged out successfully',
    authenticated: false
  });
});

module.exports = router;

