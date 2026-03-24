HOW TO RUN LOCALLY
Prerequisites
Node.js v16+ installed
MongoDB running locally (or MongoDB Atlas URI)
npm or yarn
Step 1: Clone / Set Up Project
Bash

mkdir hostel-management-system
cd hostel-management-system
Step 2: Backend Setup
Bash

mkdir -p backend/{config,middleware,models,routes,uploads}

# Navigate to backend
cd backend

# Initialize and install dependencies
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken multer
npm install -D nodemon
Copy all the backend files into their respective paths as shown above.

Step 3: Frontend Setup
Bash

# From project root
cd ..
npx create-react-app frontend
cd frontend
npm install axios react-router-dom
Replace the src/ directory content with all the frontend files shown above.

Step 4: Start MongoDB
Bash

# If using local MongoDB
mongod
Or update backend/.env with your MongoDB Atlas URI:

text

MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hostel_management
Step 5: Run Backend
Bash

cd backend
npm run dev
# Server starts on http://localhost:5000
Step 6: Run Frontend
Bash

cd frontend
npm start
# React app starts on http://localhost:3000
Step 7: Test the Application
Open http://localhost:3000 in your browser
Sign up as Admin first (to post notices, assign workers)
Sign up as Worker (to receive tasks)
Sign up as Student (to raise complaints, request cleaning, etc.)
DEPLOYMENT GUIDE (Vercel + MongoDB Atlas)
MongoDB Atlas
Go to mongodb.com/atlas
Create a free cluster
Create a database user
Whitelist IP 0.0.0.0/0
Get connection string and update .env
Deploy Backend (Render / Railway)
Bash

# Using Render.com:
# 1. Push backend code to a GitHub repo
# 2. Create new Web Service on Render
# 3. Set environment variables (MONGODB_URI, JWT_SECRET, PORT)
# 4. Deploy
Deploy Frontend (Vercel)
Bash

cd frontend

# Create .env.production
echo "REACT_APP_API_URL=https://your-backend-url.com/api" > .env.production

# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
API ENDPOINTS REFERENCE
Method	Endpoint	Auth	Description
POST	/api/auth/signup	No	Register user
POST	/api/auth/login	No	Login user
GET	/api/auth/me	Yes	Get current user
GET	/api/complaints	Yes	Get complaints
POST	/api/complaints	Student	Create complaint
PUT	/api/complaints/:id	Yes	Update complaint
GET	/api/cleaning	Yes	Get cleaning requests
POST	/api/cleaning	Student	Request cleaning
PUT	/api/cleaning/:id	Yes	Update cleaning status
PUT	/api/cleaning/:id/rate	Student	Rate cleaning
GET	/api/laundry	Yes	Get laundry requests
POST	/api/laundry	Student	Submit laundry
PUT	/api/laundry/:id	Yes	Update laundry status
GET	/api/mess	Yes	Get mess feedback
POST	/api/mess	Student	Submit feedback
GET	/api/mess/stats	Yes	Get rating averages
GET	/api/lostfound	Yes	Get lost & found items
POST	/api/lostfound	Yes	Post item
PUT	/api/lostfound/:id	Yes	Update item status
GET	/api/notices	Yes	Get notices
POST	/api/notices	Admin	Post notice
DELETE	/api/notices/:id	Admin	Delete notice
GET	/api/notifications	Yes	Get notifications
GET	/api/notifications/unread-count	Yes	Get unread count
PUT	/api/notifications/:id/read	Yes	Mark as read
PUT	/api/notifications/read-all	Yes	Mark all read
GET	/api/admin/stats	Admin	Get dashboard stats
GET	/api/admin/complaints	Admin	Get all complaints
GET	/api/admin/workers	Admin	Get workers list
PUT	/api/admin/assign/:id	Admin	Assign worker
GET	/api/worker/tasks	Worker	Get assigned tasks
PUT	/api/worker/tasks/:id	Worker	Update task status
GET	/api/worker/stats	Worker	Get worker stats