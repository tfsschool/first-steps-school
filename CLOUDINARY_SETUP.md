# Cloudinary Setup Guide

This guide will help you set up Cloudinary for file storage (CVs, resumes, and profile pictures) in your First Steps School application.

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account (includes 25GB storage and 25GB bandwidth per month)
3. Verify your email address

## Step 2: Get Your Cloudinary Credentials

1. After logging in, you'll be taken to your **Dashboard**
2. On the dashboard, you'll see your **Account Details** which include:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

   > ⚠️ **Important**: Keep your API Secret secure and never commit it to version control!

## Step 3: Add Credentials to Environment Variables

1. Open your `server/.env` file (create it if it doesn't exist)
2. Add the following variables with your actual Cloudinary credentials:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Step 4: Verify Installation

The Cloudinary packages are already installed in your `package.json`:
- `cloudinary` - Main Cloudinary SDK
- `multer-storage-cloudinary` - Multer storage adapter for Cloudinary

If you need to reinstall them:
```bash
cd server
npm install cloudinary multer-storage-cloudinary
```

## Step 5: Test the Configuration

1. Start your server:
   ```bash
   cd server
   npm run dev
   ```

2. You should see in the console:
   ```
   ✅ Cloudinary configured successfully
   ```

3. If you see an error, check that:
   - All three environment variables are set in your `.env` file
   - The credentials are correct (no extra spaces or quotes)
   - The `.env` file is in the `server/` directory

## How It Works

### File Storage Structure

Your files will be organized in Cloudinary as follows:

```
first-steps-school/
├── cvs/                    # CVs and Resumes (PDFs, Word docs)
│   └── CV-1234567890.pdf
└── profile-pictures/       # Profile Pictures (Images)
    └── profile-1234567890.jpg
```

### File Types Supported

**CVs/Resumes:**
- PDF files (`.pdf`)
- Microsoft Word documents (`.doc`, `.docx`)
- Maximum file size: 5MB for applications, 10MB for profiles

**Profile Pictures:**
- JPEG/JPG (`.jpg`, `.jpeg`)
- PNG (`.png`)
- GIF (`.gif`)
- Maximum file size: 10MB
- Automatically resized to max 500x500px

### Security Features

- Files are automatically uploaded to Cloudinary when users submit applications or create profiles
- All files are stored securely in your Cloudinary account
- Files are accessible via secure HTTPS URLs
- No files are stored locally on your server

## Troubleshooting

### Error: "Missing Cloudinary environment variables"

**Solution:** Make sure your `server/.env` file contains all three required variables:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Error: "Invalid API credentials"

**Solution:** 
1. Double-check your credentials in the Cloudinary Dashboard
2. Make sure there are no extra spaces or quotes in your `.env` file
3. Regenerate your API Secret if needed (Dashboard → Settings → Security)

### Files not uploading

**Solution:**
1. Check your Cloudinary account quota (free tier: 25GB storage, 25GB bandwidth)
2. Verify file size limits (5MB for CVs, 10MB for profile pictures)
3. Check server logs for specific error messages

## Production Deployment

When deploying to production (e.g., Vercel, Heroku, Railway):

1. Add the Cloudinary environment variables to your hosting platform's environment variable settings
2. **Never** commit your `.env` file to version control
3. Make sure your `.gitignore` includes `.env`

### Example for Vercel:
```bash
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

## Additional Resources

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Multer Storage Cloudinary](https://github.com/affanshahid/multer-storage-cloudinary)

## Support

If you encounter any issues:
1. Check the Cloudinary Dashboard for upload logs
2. Review server console logs for error messages
3. Verify your account is active and within quota limits
