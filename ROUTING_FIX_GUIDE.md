# 🚨 CRITICAL: API Routing Fix Guide

## Problem Identified

**Admin dashboard is receiving HTML instead of JSON from API endpoints.**

This is a **critical routing issue** where API requests are being handled by frontend routing instead of the backend server.

---

## Root Cause

When you access the admin dashboard in production, API calls like:
- `/api/admin/jobs`
- `/api/admin/candidates`
- `/api/admin/applications`

Are returning the frontend's `index.html` instead of JSON data from the backend.

**This happens because:**
1. Frontend is deployed separately from backend
2. API requests are going to the frontend deployment
3. Frontend doesn't have a proxy/rewrite to forward `/api/*` to backend
4. React Router serves `index.html` for all unmatched routes (including `/api/*`)

---

## Solution Applied

### **1. Created Frontend Vercel Configuration**

**File:** `client/vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://first-steps-school.vercel.app/api/:path*"
    }
  ]
}
```

**What this does:**
- Intercepts all requests to `/api/*` on the frontend deployment
- Proxies them to the backend deployment at `first-steps-school.vercel.app`
- Backend handles the request and returns JSON
- Frontend receives JSON instead of HTML

---

### **2. Added API Configuration Logging**

**File:** `client/src/config/api.js`

**Added production logging:**
```javascript
console.log('🔗 API Configuration:');
console.log('  - Environment:', process.env.NODE_ENV);
console.log('  - REACT_APP_API_URL:', process.env.REACT_APP_API_URL || '(not set)');
console.log('  - Computed BASE_URL:', BASE_URL || '(empty - relative paths)');
console.log('  - Current Origin:', window.location.origin);
console.log('  - Sample API URL:', `${BASE_URL}/api/public/jobs`);
```

**Purpose:**
- Helps diagnose routing issues in production
- Shows exactly where API requests are going
- Visible in browser console

---

### **3. Added HTML Detection in AdminDashboard**

**File:** `client/src/pages/AdminDashboard.js`

**Added checks:**
```javascript
// Check for HTML response (routing error)
if (typeof res.data === 'string' && res.data.includes('<!doctype html>')) {
  console.error('❌ API Routing Error: /api/admin/jobs returned HTML instead of JSON');
  console.error('This means the API request is being handled by frontend routing, not the backend.');
  return;
}
```

**Purpose:**
- Detects HTML responses immediately
- Logs clear error message
- Prevents crash from trying to use HTML as array

---

## Deployment Steps

### **Step 1: Update Backend Vercel URL (if needed)**

The `client/vercel.json` currently points to:
```
https://first-steps-school.vercel.app
```

**Verify this is your backend deployment URL:**
1. Go to Vercel dashboard
2. Find your backend project
3. Copy the production URL
4. Update `client/vercel.json` if different

**Common backend URLs:**
- `https://first-steps-school.vercel.app` (current)
- `https://first-steps-school-backend.vercel.app`
- `https://first-steps-school-server.vercel.app`

---

### **Step 2: Deploy Changes**

```bash
# Commit changes
git add .
git commit -m "Fix API routing - add Vercel proxy configuration"
git push

# Vercel will auto-deploy both frontend and backend
```

---

### **Step 3: Verify Fix**

**After deployment, check browser console:**

1. **Look for API Configuration log:**
```
🔗 API Configuration:
  - Environment: production
  - REACT_APP_API_URL: (not set)
  - Computed BASE_URL: (empty - relative paths)
  - Current Origin: https://tfs.school
  - Sample API URL: /api/public/jobs
```

2. **Check Network tab:**
   - Open DevTools → Network tab
   - Navigate to admin dashboard
   - Look for requests to `/api/admin/jobs`, `/api/admin/candidates`, etc.
   - **Response should be JSON, NOT HTML**

3. **Look for routing errors:**
   - If you see: `❌ API Routing Error: ... returned HTML instead of JSON`
   - The proxy is not working correctly

---

## Alternative Solutions

If the Vercel rewrite doesn't work, try these alternatives:

### **Option A: Environment Variable Approach**

**Set in Frontend Vercel Project:**
```bash
REACT_APP_API_URL=https://first-steps-school.vercel.app
```

**Then update `client/vercel.json`:**
```json
{
  "rewrites": []
}
```

This makes frontend directly call the backend URL instead of using relative paths.

---

### **Option B: Same-Origin Deployment**

Deploy both frontend and backend to the same domain using Vercel monorepo:

**Root `vercel.json`:**
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/server/server.js"
    },
    {
      "source": "/:path*",
      "destination": "/client/:path*"
    }
  ]
}
```

This requires restructuring the deployment.

---

### **Option C: Custom Domain with Subdomains**

- Frontend: `https://tfs.school`
- Backend: `https://api.tfs.school`

**Set in Frontend Vercel:**
```bash
REACT_APP_API_URL=https://api.tfs.school
```

**Update backend CORS to allow `tfs.school`**

---

## Testing Checklist

After deploying the fix:

- [ ] Admin dashboard loads without errors
- [ ] Jobs list displays correctly
- [ ] Candidates list displays correctly
- [ ] Applications list displays correctly
- [ ] No "filter is not a function" errors
- [ ] No HTML in console warnings
- [ ] Network tab shows JSON responses
- [ ] API Configuration log shows correct URLs

---

## Troubleshooting

### **Issue: Still receiving HTML**

**Check:**
1. `client/vercel.json` is deployed (check Vercel dashboard)
2. Backend URL in `vercel.json` is correct
3. Backend is actually deployed and running
4. CORS is configured correctly on backend

**Test backend directly:**
```bash
curl https://first-steps-school.vercel.app/api/admin/jobs \
  -H "x-auth-token: YOUR_TOKEN"
```

Should return JSON, not HTML.

---

### **Issue: CORS errors**

**Backend CORS must allow frontend domain:**

In `server/server.js`, verify CORS configuration:
```javascript
const allowedOrigins = [
  'https://tfs.school',
  'https://first-steps-school-frontend.vercel.app',
  // Add your frontend URL
];
```

---

### **Issue: 404 on API routes**

**Backend routes might not be deployed:**

Check `server/vercel.json`:
```json
{
  "version": 2,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/server.js"
    }
  ]
}
```

This should route all backend requests to Express.

---

## Summary

**Files Modified:**
1. ✅ `client/vercel.json` - Created (proxy API to backend)
2. ✅ `client/src/config/api.js` - Added production logging
3. ✅ `client/src/pages/AdminDashboard.js` - Added HTML detection

**Expected Result:**
- Admin dashboard receives JSON from API endpoints
- No HTML responses
- No "filter is not a function" errors
- Production-stable admin panel

**Next Step:**
Deploy and test in production. Check browser console for API configuration and routing errors.
