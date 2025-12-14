# Network Setup Instructions

## Current IP Address
Your current IP address is: **192.168.18.75**

## Steps to Fix Connection Issues

### 1. Create Client .env File
Create a file named `.env` in the `client` folder with the following content:

```
REACT_APP_API_URL=http://192.168.18.75:5000
REACT_APP_FRONTEND_URL=http://192.168.18.75:3000
```

**Important:** After creating/updating the `.env` file, you must restart the React development server for changes to take effect.

### 2. Start the Server
Make sure the backend server is running:

```bash
cd server
npm start
```

The server should start on port 5000 and be accessible at:
- `http://localhost:5000` (from the same device)
- `http://192.168.18.75:5000` (from other devices on the same network)

### 3. Start the Frontend
After creating the `.env` file, restart the React app:

```bash
cd client
npm start
```

The frontend should start on port 3000 and be accessible at:
- `http://localhost:3000` (from the same device)
- `http://192.168.18.75:3000` (from other devices on the same network)

### 4. If IP Address Changes
If your IP address changes (e.g., after reconnecting to WiFi), update the `.env` file in the `client` folder with the new IP address and restart both the server and frontend.

### 5. Check Firewall
Make sure Windows Firewall allows connections on ports 3000 and 5000, or temporarily disable the firewall for testing.

