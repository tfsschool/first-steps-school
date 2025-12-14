# Deployment Guide - First Steps School Website

This guide will help you deploy the First Steps School website to the internet so it can be accessed from anywhere.

## Prerequisites

1. **Domain Name** (optional but recommended)
   - Purchase a domain name (e.g., firststepsschool.com)
   - Or use a free subdomain from hosting providers

2. **Hosting Services**
   - **Backend**: Node.js hosting (Heroku, Railway, Render, DigitalOcean, AWS, etc.)
   - **Frontend**: Static hosting (Vercel, Netlify, GitHub Pages, etc.)
   - **Database**: MongoDB Atlas (cloud) or your own MongoDB server

3. **Email Service**
   - Gmail with App Password
   - Or services like SendGrid, Mailgun, AWS SES

## Step 1: Prepare Environment Variables

### Backend (.env file in `server/` directory)

Create a `.env` file in the `server/` directory:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/firststeps
JWT_SECRET=your-very-strong-random-secret-key-here
FRONTEND_URL=https://yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com
```

### Frontend (.env file in `client/` directory)

Create a `.env` file in the `client/` directory:

```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_FRONTEND_URL=https://yourdomain.com
```

**Important**: 
- Replace `yourdomain.com` with your actual domain
- If backend and frontend are on different domains, use the full backend URL
- For React apps, environment variables must start with `REACT_APP_`

## Step 2: Set Up MongoDB Atlas (Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Create a database user
5. Whitelist IP addresses (use `0.0.0.0/0` for all IPs, or your server IP)
6. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/firststeps`
7. Update `MONGODB_URI` in your backend `.env` file

## Step 3: Deploy Backend (Node.js Server)

### Option A: Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-uri
   heroku config:set JWT_SECRET=your-secret
   heroku config:set FRONTEND_URL=https://yourdomain.com
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASS=your-password
   heroku config:set ADMIN_EMAIL=admin@yourdomain.com
   ```
5. Deploy: `git push heroku main`
6. Your backend will be at: `https://your-app-name.herokuapp.com`

### Option B: Deploy to Railway

1. Go to [Railway](https://railway.app)
2. Create new project
3. Connect your GitHub repository
4. Add environment variables in Railway dashboard
5. Deploy automatically

### Option C: Deploy to Render

1. Go to [Render](https://render.com)
2. Create new Web Service
3. Connect your repository
4. Set build command: `cd server && npm install`
5. Set start command: `cd server && npm start`
6. Add environment variables
7. Deploy

## Step 4: Deploy Frontend (React App)

### Option A: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. In `client/` directory: `vercel`
3. Follow prompts
4. Add environment variables in Vercel dashboard:
   - `REACT_APP_API_URL`: Your backend URL
   - `REACT_APP_FRONTEND_URL`: Your frontend URL
5. Redeploy: `vercel --prod`

### Option B: Deploy to Netlify

1. Build the React app: `cd client && npm run build`
2. Go to [Netlify](https://netlify.com)
3. Drag and drop the `client/build` folder
4. Or connect GitHub repository
5. Set build command: `npm run build`
6. Set publish directory: `build`
7. Add environment variables in Netlify dashboard
8. Deploy

### Option C: Deploy to GitHub Pages

1. Install: `npm install --save-dev gh-pages`
2. Add to `client/package.json`:
   ```json
   "homepage": "https://yourusername.github.io/first-steps-school",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d build"
   }
   ```
3. Deploy: `npm run deploy`

## Step 5: Configure Domain (Optional)

### For Backend

1. In your hosting provider, add a custom domain
2. Point DNS A record or CNAME to your server IP/hostname
3. Update `FRONTEND_URL` in backend `.env` to use your domain

### For Frontend

1. In your hosting provider, add a custom domain
2. Point DNS A record or CNAME to your hosting provider
3. Update `REACT_APP_FRONTEND_URL` in frontend `.env`

## Step 6: Update CORS Settings

The backend is already configured to use `FRONTEND_URL` from environment variables for CORS. Make sure your `.env` file has the correct frontend URL.

## Step 7: Test Your Deployment

1. **Test Frontend**: Visit your frontend URL
2. **Test Backend**: Visit `https://your-backend-url/api/public/jobs`
3. **Test Registration**: Try registering a new user
4. **Test Email**: Check if verification emails are sent
5. **Test Admin**: Login to admin dashboard

## Step 8: Security Checklist

- [ ] Change default admin password
- [ ] Use strong JWT_SECRET (random string)
- [ ] Use HTTPS (SSL certificate)
- [ ] Remove `/create-admin` route in production
- [ ] Set secure MongoDB user credentials
- [ ] Limit MongoDB IP whitelist if possible
- [ ] Use environment variables (never commit .env files)
- [ ] Enable rate limiting (optional)
- [ ] Set up error monitoring (optional)

## Step 9: Build Commands

### Development
```bash
# Backend
cd server
npm install
npm run dev

# Frontend
cd client
npm install
npm start
```

### Production Build
```bash
# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm run build
# Deploy the 'build' folder
```

## Troubleshooting

### CORS Errors
- Check `FRONTEND_URL` in backend `.env` matches your frontend domain
- Ensure CORS middleware is configured correctly

### API Connection Errors
- Verify `REACT_APP_API_URL` in frontend `.env` matches your backend URL
- Check if backend is running and accessible
- Verify CORS settings allow your frontend domain

### Email Not Sending
- Check email credentials in `.env`
- For Gmail, use App Password (not regular password)
- Verify SMTP settings

### Database Connection Errors
- Check MongoDB connection string
- Verify IP whitelist includes your server IP
- Check database user credentials

## Support

For issues or questions, check:
- Server logs in your hosting provider dashboard
- Browser console for frontend errors
- Network tab for API request/response details

## Example Deployment URLs

- **Frontend**: `https://firststepsschool.com`
- **Backend**: `https://api.firststepsschool.com` or `https://firststepsschool.herokuapp.com`
- **Database**: MongoDB Atlas cluster

Remember to update all URLs in your `.env` files accordingly!

