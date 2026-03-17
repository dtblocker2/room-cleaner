🚀 SETUP & RUNNING INSTRUCTIONS
Prerequisites
Node.js (v16+): https://nodejs.org
MongoDB: Install locally (https://www.mongodb.com/try/download/community) OR use MongoDB Atlas (free cloud)
Step-by-step Setup
Bash

# 1. Create the project folder and add all files as shown above
mkdir hostel-cleaning-app
cd hostel-cleaning-app

# 2. Create the folder structure
mkdir -p backend/config backend/middleware backend/models backend/routes
mkdir -p frontend/public frontend/src/context frontend/src/components frontend/src/pages

# 3. Add all the files listed above to their respective paths

# 4. Install all dependencies
npm run install-all
# (or manually: cd backend && npm install && cd ../frontend && npm install)

# 5. Make sure MongoDB is running
# On Mac:   brew services start mongodb-community
# On Linux: sudo systemctl start mongod
# On Windows: MongoDB should run as a service

# 6. Seed the database with default accounts
npm run seed

# 7. Build the frontend
npm run build

# 8. Start the server
npm start
Default Test Accounts (created by seed)
Role	Email	Password
Staff	staff@hostel.com	staff123
Student	student@hostel.com	student123
Accessing from Other Devices on WiFi
When the server starts, it prints your Network URL like:

text

🚀  Server running on port 5000
   Local:   http://localhost:5000
   Network: http://192.168.1.42:5000

   📱 Share the Network URL with hostel members!
Share that http://192.168.x.x:5000 URL — anyone on the same WiFi can open it on their phone or laptop browser.

Windows Firewall: If others can't connect, allow port 5000 through Windows Firewall:
Settings → Firewall → Allow an app → Add port 5000 (TCP)

Staff Registration
New staff members can self-register using the code STAFF2024 (configurable in backend/.env → STAFF_CODE).

Key Features Delivered
Feature	Details
Student ticket creation	Date, time window, priority, special instructions
Staff accepts & completes	Browse pending tickets, accept, mark done
Student verification	Verify or reject with star rating & feedback
Settings page	Edit name, email, room, block, phone, password
Dashboard stats	Visual stat cards with live counts
Priority levels	Low / Medium / High / Urgent with color coding
Status tracking	Visual timeline: Pending → Accepted → Completed → Verified
Auto-refresh	Dashboards refresh automatically (30s student, 15s staff)
Mobile responsive	Works on phone browsers with hamburger menu
LAN hosting	Auto-detects and displays network IP on startup
Role-based access	Separate views and permissions for students & staff
Rating system	1–5 star rating with written feedback
Seed script	One-command setup with test accounts