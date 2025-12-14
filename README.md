# First Steps School Website

A full-stack web application for First Steps School built with React, Node.js, Express.js, and MongoDB. This application allows the school to manage job postings and applications, while providing a public-facing website for potential candidates.

## Features

### Public Features
- **Home Page**: Welcome page with information about the school
- **Careers Page**: View all available job positions
- **Contact Us Page**: Contact form for inquiries
- **Application Form**: Users can apply for available positions with:
  - Personal information (name, email, phone)
  - Education details
  - CV upload (PDF/Doc)

### Admin Features
- **Secure Admin Login**: Protected admin dashboard
- **Job Management**: Add and remove job positions
- **View Applications**: See all applicants for each position
- **CSV Export**: Download applicant data as CSV files
- **CV Access**: View and download applicant CVs

## Technology Stack

### Frontend
- React 19
- React Router DOM
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File Upload)
- json2csv (CSV Export)

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```env
MONGO_URI=mongodb://localhost:27017/first-steps-school
JWT_SECRET=your-secret-key-change-this-in-production
PORT=5000
```

4. Create the admin user (run this once):
   - Start the server: `npm start` or `npm run dev`
   - Visit: `http://localhost:5000/create-admin`
   - This creates an admin with username: `admin` and password: `admin123`
   - **Important**: Remove or protect this route in production!

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The client will run on `http://localhost:3000`

## Usage

### For Public Users

1. Visit the website at `http://localhost:3000`
2. Navigate to the **Careers** page to see available positions
3. Click **Apply Now** on any position
4. Fill out the application form and upload your CV
5. Submit the application

### For Admin

1. Navigate to `http://localhost:3000/admin/login`
2. Login with credentials:
   - Username: `admin`
   - Password: `admin123`
3. In the Admin Dashboard:
   - **Add New Position**: Fill in title and description, then click Add
   - **View Applicants**: Click on any job to see applicants
   - **Delete Job**: Click the Delete button next to any job
   - **Download CSV**: Click "Download CSV" to export applicant data
   - **View CV**: Click "View CV" link to download/view applicant CVs

## Security Features

- JWT-based authentication for admin routes
- Protected admin dashboard (requires login)
- File upload validation (PDF/Doc only, 5MB limit)
- Input validation and sanitization
- CORS enabled for frontend-backend communication

## Project Structure

```
first-steps-school/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── uploads/            # Uploaded CV files
│   ├── server.js           # Server entry point
│   └── package.json
└── README.md
```

## API Endpoints

### Public Routes (`/api/public`)
- `GET /jobs` - Get all open job positions
- `POST /apply/:jobId` - Submit application for a job

### Admin Routes (`/api/admin`)
- `POST /login` - Admin login
- `GET /jobs` - Get all jobs (protected)
- `POST /job` - Add new job (protected)
- `DELETE /job/:id` - Delete job (protected)
- `GET /applications/:jobId` - Get applicants for a job (protected)
- `GET /download-csv/:jobId` - Download CSV of applicants (protected)

## Important Notes

1. **Admin Creation**: The `/create-admin` route should be removed or protected in production
2. **Environment Variables**: Always use strong JWT_SECRET in production
3. **File Uploads**: CV files are stored in `server/uploads/` directory
4. **Database**: Ensure MongoDB is running before starting the server
5. **CORS**: Currently configured for localhost development

## Future Enhancements

- Email notifications for new applications
- Application status tracking
- Admin password change functionality
- Multiple admin users support
- Application filtering and search
- Resume parsing and keyword extraction

## License

ISC

