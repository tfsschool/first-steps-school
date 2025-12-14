# Network Setup Script for First Steps School Website
# This script helps you set up environment files for network access

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Network Setup for First Steps School" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Your network configuration
$SERVER_IP = "192.168.18.48"
$OTHER_LAPTOP_IP = "192.168.18.240"

Write-Host "Network Configuration:" -ForegroundColor Yellow
Write-Host "  Server Laptop IP: $SERVER_IP" -ForegroundColor Green
Write-Host "  Other Laptop IP: $OTHER_LAPTOP_IP" -ForegroundColor Green
Write-Host ""

# Create server/.env
Write-Host "Creating server/.env..." -ForegroundColor Yellow
$serverEnvContent = @"
# Server Port
PORT=5000

# MongoDB Connection (use local MongoDB or MongoDB Atlas)
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/firststeps
# For MongoDB Atlas (cloud):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/firststeps

# JWT Secret (use any random string for testing)
JWT_SECRET=test-secret-key-change-in-production

# Frontend URL (for CORS and email links)
# Your current laptop IP - other devices will access using this
FRONTEND_URL=http://$SERVER_IP:3000

# Local IP address (for network testing)
LOCAL_IP=$SERVER_IP

# Email Configuration (for sending verification emails)
# For Gmail, use App Password (not regular password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Admin Email (for receiving notifications)
ADMIN_EMAIL=admin@firststepsschool.com
"@

Set-Content -Path "server\.env" -Value $serverEnvContent -Encoding UTF8
Write-Host "  ✓ server/.env created" -ForegroundColor Green

# Create client/.env
Write-Host "Creating client/.env..." -ForegroundColor Yellow
$clientEnvContent = @"
# API Base URL (Backend Server URL)
# Use your current laptop's IP so other devices can access it
REACT_APP_API_URL=http://$SERVER_IP:5000

# Frontend URL (Your website URL)
# Use your current laptop's IP so other devices can access it
REACT_APP_FRONTEND_URL=http://$SERVER_IP:3000
"@

Set-Content -Path "client\.env" -Value $clientEnvContent -Encoding UTF8
Write-Host "  ✓ client/.env created" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure Windows Firewall (see NETWORK_SETUP.md)" -ForegroundColor White
Write-Host "2. Start backend: cd server && npm start" -ForegroundColor White
Write-Host "3. Start frontend: cd client && npm start" -ForegroundColor White
Write-Host "4. Access from other laptop: http://$SERVER_IP:3000" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see NETWORK_SETUP.md" -ForegroundColor Cyan
Write-Host ""
