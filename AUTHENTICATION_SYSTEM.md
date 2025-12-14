# Secure Email-Based Authentication System

## Overview

This document describes the secure authentication system implemented for the First Steps School job application platform. The system uses passwordless email-based authentication with HTTP-only cookies for session management.

## Key Features

✅ **No localStorage** - All authentication data is stored in HTTP-only cookies
✅ **Passwordless Login** - Users receive magic link emails to login
✅ **Secure Sessions** - JWT tokens stored in HTTP-only cookies (7-day expiry)
✅ **Email Verification** - Required before account activation
✅ **Session-Based Auth** - All protected routes use authenticated sessions
✅ **Automatic Logout** - Sessions expire after 7 days or on explicit logout

## Backend Implementation

### Authentication Middleware

Location: `server/middleware/auth.js`

- `authenticate` - Verifies JWT token from HTTP-only cookie
- `optionalAuth` - Optional authentication (doesn't fail if not authenticated)

### Routes Updated

1. **Candidate Routes** (`server/routes/candidateRoutes.js`)
   - `POST /api/candidate/register` - Register with email verification
   - `GET /api/candidate/verify-email` - Verify email (creates session)
   - `POST /api/candidate/login` - Request login link (passwordless)
   - `GET /api/candidate/verify-login` - Verify login token (creates session)
   - `GET /api/candidate/check-auth` - Check authentication status
   - `POST /api/candidate/logout` - Logout (clears cookie)

2. **Profile Routes** (`server/routes/profileRoutes.js`)
   - `GET /api/profile` - Get profile (uses authenticated email)
   - `GET /api/profile/check` - Check if profile exists (uses authenticated email)
   - `POST /api/profile` - Create/update profile (uses authenticated email)

3. **Public Routes** (`server/routes/publicRoutes.js`)
   - `GET /api/public/jobs` - Get open jobs (public)
   - `GET /api/public/check-application/:jobId` - Check application (authenticated)
   - `POST /api/public/apply/:jobId` - Submit application (authenticated)

### Cookie Configuration

- **Name**: `authToken`
- **Type**: HTTP-only (JavaScript cannot access)
- **Secure**: HTTPS only in production
- **SameSite**: Strict (CSRF protection)
- **MaxAge**: 7 days

## Frontend Implementation

### API Configuration

Location: `client/src/config/api.js`

All endpoints updated to use session-based authentication (no email parameters for protected routes).

### Required Frontend Changes

1. **Remove localStorage Usage**
   - Remove all `localStorage.getItem('userEmail')`
   - Remove all `localStorage.setItem('userEmail', ...)`
   - Remove all `localStorage.removeItem('userEmail')`

2. **Add Authentication Check**
   - Create `useAuth` hook or context to check authentication status
   - Call `GET /api/candidate/check-auth` on app load
   - Store authentication state in React state (not localStorage)

3. **Update Pages**

   **Careers.js**
   - Remove email from localStorage
   - Check auth status on load
   - Show login modal if not authenticated
   - Use authenticated email from session

   **Login Page** (New)
   - Create `LoginVerify.js` page for magic link verification
   - Handle login link clicks
   - Redirect to careers after successful login

   **Apply.js**
   - Remove email from URL params
   - Get email from authenticated session
   - Check authentication before allowing application

   **CreateProfile.js**
   - Remove email from URL params
   - Get email from authenticated session
   - Check authentication before allowing profile creation

   **VerifyEmail.js**
   - After email verification, session is created automatically
   - Redirect to careers page

4. **Add Logout Functionality**
   - Call `POST /api/candidate/logout`
   - Clear authentication state
   - Redirect to login/careers page

5. **Protected Routes**
   - Add route guards for authenticated pages
   - Redirect to login if not authenticated

## User Flow

### Registration Flow
1. User enters email on Careers page
2. System sends verification email
3. User clicks verification link
4. Email verified → Session created automatically
5. User redirected to Careers page (authenticated)

### Login Flow (Passwordless)
1. User enters email on Login page
2. System checks if email is registered and verified
3. System sends magic link email (15-minute expiry)
4. User clicks login link
5. Token verified → Session created
6. User redirected to Careers page (authenticated)

### Logout Flow
1. User clicks logout
2. Backend clears HTTP-only cookie
3. Frontend clears authentication state
4. User redirected to Careers page (unauthenticated)

## Security Features

1. **HTTP-Only Cookies** - Prevents XSS attacks
2. **Secure Flag** - HTTPS only in production
3. **SameSite Strict** - CSRF protection
4. **Token Expiry** - 7-day session expiry
5. **One-Time Tokens** - Login tokens are single-use
6. **Email Verification** - Required before account activation
7. **Rate Limiting** - Should be added for production

## Testing Checklist

- [ ] Register new user → Email verification → Session created
- [ ] Login with magic link → Session created
- [ ] Access protected routes without auth → Redirected to login
- [ ] Logout → Cookie cleared → Cannot access protected routes
- [ ] Apply for job → Uses authenticated email
- [ ] Create profile → Uses authenticated email
- [ ] Session persists across page refreshes
- [ ] Session expires after 7 days

## Migration Notes

**Breaking Changes:**
- All protected routes now require authentication
- Email parameters removed from protected routes
- localStorage no longer used for authentication

**Backward Compatibility:**
- Public job listings still work without auth
- Registration flow remains the same
- Email verification flow enhanced (creates session)

## Next Steps

1. Update frontend pages to use session-based auth
2. Create LoginVerify page for magic link handling
3. Add authentication context/hook
4. Add route protection
5. Test all flows
6. Add rate limiting for production

