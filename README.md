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

The client will run on ``

## Usage

### For Public Users

1. Visit the website at ``
2. Navigate to the **Careers** page to see available positions
3. Click **Apply Now** on any position
4. Fill out the application form and upload your CV
5. Submit the application


ISC

