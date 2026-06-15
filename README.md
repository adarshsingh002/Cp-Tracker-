# CP Tracker (Competitive Programming Tracker)

CP Tracker is a full-stack web application designed for competitive programmers to track their progress, analyze performance metrics, discuss problems with peers, and write & execute code in a built-in workspace.

The application integrates with popular competitive programming platforms like **Codeforces** and **LeetCode**, and provides a rich, modern dashboard with interactive analytics.

---

## 🚀 Key Features

- **Personalized Dashboards**:
  - **Codeforces Integration**: Track your rating history, submissions, visual analytics of solved problems by difficulty/tags, and user rank.
  - **LeetCode Integration**: View solved problem counts, platform stats, and detailed submission history.
- **Problem Workspace**: A built-in code editor environment to write, edit, and execute code directly from the browser.
- **Discussion Forums**: Ask questions, share solutions, and engage in discussions with other competitive programming enthusiasts.
- **User Authentication**: Secure signup and login powered by JWT (JSON Web Tokens) and bcrypt password hashing.

---

## 🛠️ Technology Stack

### Frontend
- **React** with **Vite** for a fast development experience and optimized production bundle.
- **CSS3** (Vanilla CSS) for customized, responsive styling and animations.
- **Axios** for API communication with the backend.

### Backend
- **Node.js** & **Express** framework for the RESTful API server.
- **MongoDB** with **Mongoose** ODM for data storage.
- **JSON Web Tokens (JWT)** for authentication.
- **Bcrypt** for securing credentials.

---

## 📁 Directory Structure

```text
CP Tracker/
├── backend/                  # Node.js/Express Backend API
│   ├── controllers/          # Business logic handlers
│   ├── models/               # MongoDB Mongoose schemas (User, Post, etc.)
│   ├── routes/               # API endpoint routers (auth, codeforces, leetcode, discussions, execute)
│   └── server.js             # Main server entrypoint
│
├── frontend/                 # React/Vite Frontend App
│   ├── public/               # Static assets
│   └── src/
│       ├── components/       # Reusable components (Navbar, LoadingSpinner)
│       │   └── workspace/    # Problem workspace component (code editor)
│       ├── pages/            # Page components (AuthPage, HomePage, Dashboards, Discussions)
│       ├── App.jsx           # App layout & routing
│       └── main.jsx          # App entrypoint
│
├── package.json              # Monorepo dependencies and scripts
└── README.md                 # Project documentation (this file)
```

---

## ⚙️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) or a local MongoDB instance

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd "Cp Tracker"
```

### Step 2: Configure Environment Variables

1. Navigate to the `backend` folder and create a `.env` file:
   ```bash
   cd backend
   touch .env
   ```
2. Add the following environment variables to your `.env` file:
   ```env
   PORT=5001
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

### Step 3: Install Dependencies

From the root directory, install all required packages:
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 4: Run the Application

#### Running the Backend
From the `backend` directory:
```bash
npm start
# or
node server.js
```
The API server will run on `http://localhost:5001`.

#### Running the Frontend
From the `frontend` directory:
```bash
npm run dev
```
The React development server will start (usually on `http://localhost:5173`).
