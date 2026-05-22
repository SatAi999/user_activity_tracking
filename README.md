# TaskFlow — Role-Based Task Management & Activity Tracking

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![Deployed on Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?logo=railway)
![Deployed on Netlify](https://img.shields.io/badge/Frontend-Netlify-00C7B7?logo=netlify&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

TaskFlow is a full-stack task management application with a proper two-tier access system. Regular users get a clean personal task board with categories, due dates, comments, and notifications. Admins get a separate control panel with visibility into every user, every task, real-time analytics (charts), and a timestamped audit log of everything that has happened in the system.

Access control is enforced at the API layer — not just hidden buttons in the UI. Hit an admin endpoint without the right role and you get a `403` back, regardless of what the frontend looks like.

---

## Table of Contents

- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started (Local)](#getting-started-local)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role & Permissions](#role--permissions)
- [Activity Logging](#activity-logging)
- [Creating an Admin Account](#creating-an-admin-account)
- [Deployment](#deployment)

---

## Live Demo

| Service | URL |
|---------|-----|
| Frontend (Netlify) | https://user-tracking-rbac-app.netlify.app |
| Backend API (Railway) | https://useractivitytracking-production.up.railway.app |

---

## Features

### For regular users
- Register and log in with JWT-based authentication
- Create tasks with title, description, **priority**, **category** (Work / Personal / Urgent / Other), **due date**, and status
- Edit and delete your own tasks; filter by status, category, and priority
- **Add comments** on any task and see other comments in real time
- **In-app notifications** — get notified when an admin assigns you a task, leaves a comment, or when a task is overdue
- **Profile page** — update your name, avatar, and password
- Deactivated accounts are blocked at login — they cannot obtain a token at all

### For admins
- **Analytics dashboard** — stat cards + interactive Recharts bar, line, and pie charts (tasks by status, by category, activity over the last 7 days, per-user productivity)
- **User management** — view all users, toggle active/inactive status, delete users, and **assign tasks directly** to any user
- **Task monitoring** — all tasks across every user, searchable and filterable by status
- **Activity logs** — last 200 events, filterable by action type, searchable by user or detail
- **Global search** — search tasks and users across the entire platform from one endpoint

### System-wide
- All sensitive routes are protected with JWT middleware
- Admin routes have a second guard — authenticated non-admin users still get `403`
- Every meaningful action is recorded to an audit log (user, timestamp, IP address, plain-English description)
- **Dark mode** — premium deep-space dark theme toggled via a moon/sun button in the navbar, persisted to `localStorage`
- **Self-registration is always `role: user`** — admin accounts can only be created via the database or seed script

---

## Tech Stack

### Backend

| Package | Purpose |
|---|---|
| Express 4 | HTTP server and routing |
| Mongoose 8 | MongoDB ODM |
| jsonwebtoken | Signing and verifying JWTs |
| bcryptjs | Password hashing (10 salt rounds) |
| express-validator | Request body validation |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

### Frontend

| Package | Purpose |
|---|---|
| React 19 + Vite | UI framework and dev server |
| React Router v7 | Client-side routing |
| Axios | HTTP client with JWT interceptor |
| Tailwind CSS v4 | Utility-first styling |
| Recharts | Analytics charts (Bar, Line, Pie) |
| react-hot-toast | Non-blocking toast notifications |
| react-icons/fi | Feather icon set |

---

## Project Structure

```
User_Activity_RBAC/
│
├── .env.example                     # Documents all required environment variables
│
├── backend/
│   ├── config/
│   │   └── db.js                    # Mongoose connection
│   │
│   ├── controllers/
│   │   ├── authController.js        # register (always role:user), login, getMe, updateProfile
│   │   ├── taskController.js        # CRUD for user-scoped tasks
│   │   ├── adminController.js       # analytics, users, tasks, logs, assignTask, search
│   │   ├── commentController.js     # getComments, addComment (triggers notifications)
│   │   └── notificationController.js# getNotifications, markRead, markAllRead
│   │
│   ├── middleware/
│   │   └── auth.js                  # protect() — JWT + active status check
│   │                                # adminOnly() — role === 'admin' guard
│   │
│   ├── models/
│   │   ├── User.js                  # name, email, password (hashed), role, status, avatar
│   │   ├── Task.js                  # title, description, status, priority, category,
│   │   │                            #   dueDate, user, assignedTo, assignedBy, isAdminAssigned
│   │   ├── Comment.js               # task, user, content (max 1000 chars)
│   │   ├── Notification.js          # user, message, type, read, task ref
│   │   └── ActivityLog.js           # user, action enum, details, ipAddress
│   │
│   ├── routes/
│   │   ├── auth.js                  # /register, /login, /me, /profile
│   │   ├── tasks.js                 # CRUD + GET /:id/comments, POST /:id/comments
│   │   ├── admin.js                 # /analytics, /users, /tasks, /logs, /tasks/assign, /search
│   │   └── notifications.js        # GET /, PATCH /read-all, PATCH /:id/read
│   │
│   ├── seedData.js                  # Seeds admin + sample users/tasks
│   ├── .env.example
│   └── server.js                    # Express setup, dynamic CORS, route mounting
│
└── frontend/
    ├── public/
    │   └── _redirects               # Netlify SPA redirect rule (/* → /index.html)
    ├── vite.config.js               # Vite + Tailwind plugin + /api proxy to :5000
    └── src/
        ├── api/
        │   └── axios.js             # baseURL from VITE_API_URL env var (prod) or /api (dev)
        │
        ├── context/
        │   ├── AuthContext.jsx      # user + token state, login/register/logout
        │   └── ThemeContext.jsx     # dark mode state, toggles .dark class on <html>
        │
        ├── components/
        │   ├── Navbar.jsx           # Dark mode toggle, notifications bell, profile link
        │   ├── ProtectedRoute.jsx   # Redirects to /login if unauthenticated
        │   └── AdminRoute.jsx       # Redirects to /dashboard if not admin
        │
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx        # Greeting, stat cards, progress bar, quick actions
            ├── Tasks.jsx            # Personal task board — filter, create, edit, comments
            ├── Profile.jsx          # Update name, avatar, password
            └── admin/
                ├── AdminDashboard.jsx    # Recharts analytics (Bar, Line, Pie)
                ├── UserManagement.jsx    # User table + assign task modal
                ├── TaskMonitoring.jsx    # All tasks with search + status filter
                └── ActivityLogs.jsx      # Audit trail with action + user filter
```

---

## Getting Started (Local)

### Prerequisites
- Node.js v18 or higher
- A free [MongoDB Atlas](https://cloud.mongodb.com) cluster (or local MongoDB)

### 1. Clone the repo

```bash
git clone https://github.com/SatAi999/user_activity_tracking.git
cd user_activity_tracking
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env   # then fill in your values
```

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/user_activity_rbac
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173   # frontend origin for CORS
```

Start the server:
```bash
npm start
```

You should see:
```
Server running on port 5000
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### 3. (Optional) Seed sample data

```bash
node seedData.js
```

This creates one admin and two regular users with sample tasks.

| Email | Password | Role |
|-------|----------|------|
| admin@taskflow.com | admin123 | admin |
| alice@taskflow.com | user123 | user |
| bob@taskflow.com | user123 | user |

### 4. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The Vite proxy forwards all `/api/*` requests to `http://localhost:5000` so there are no CORS issues in development.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWTs (use 32+ random chars) |
| `JWT_EXPIRE` | No | Token lifetime — default `7d` |
| `PORT` | No | Server port — default `5000` (Railway sets this automatically) |
| `CLIENT_URL` | No | Frontend origin allowed by CORS (e.g. `https://app.netlify.app`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|:---:|---|
| `VITE_API_URL` | No | Railway backend URL — e.g. `https://your-app.up.railway.app`. If unset, falls back to `/api` (local proxy). |

---

## API Reference

Base URL (local): `http://localhost:5000/api`  
All protected routes require: `Authorization: Bearer <token>`

### Auth

| Method | Route | Auth | Description |
|---|---|:---:|---|
| `POST` | `/auth/register` | ❌ | Create account. Role is always `user`. |
| `POST` | `/auth/login` | ❌ | Returns user object + JWT. |
| `GET` | `/auth/me` | ✅ | Get current user. |
| `PUT` | `/auth/profile` | ✅ | Update name, avatar, or password. |

### Tasks

| Method | Route | Description |
|---|---|---|
| `GET` | `/tasks` | All tasks for the logged-in user |
| `POST` | `/tasks` | Create a task (`title` required; optional: `description`, `priority`, `category`, `dueDate`, `status`) |
| `PUT` | `/tasks/:id` | Update own task |
| `DELETE` | `/tasks/:id` | Delete own task |
| `GET` | `/tasks/:id/comments` | Get comments on a task |
| `POST` | `/tasks/:id/comments` | Add a comment (triggers notification) |

### Notifications

| Method | Route | Description |
|---|---|---|
| `GET` | `/notifications` | Get all notifications for the current user |
| `PATCH` | `/notifications/read-all` | Mark all as read |
| `PATCH` | `/notifications/:id/read` | Mark one as read |

### Admin (requires `role: admin`)

| Method | Route | Description |
|---|---|---|
| `GET` | `/admin/analytics` | Stats + chart data (byCategory, byDay, perUser) |
| `GET` | `/admin/users` | All users |
| `DELETE` | `/admin/users/:id` | Delete user + all their tasks |
| `PATCH` | `/admin/users/:id/status` | Toggle active/inactive |
| `GET` | `/admin/tasks` | All tasks system-wide |
| `DELETE` | `/admin/tasks/:id` | Delete any task |
| `POST` | `/admin/tasks/assign` | Assign a new task to a user |
| `GET` | `/admin/logs` | Latest 200 activity log entries |
| `GET` | `/admin/search?q=` | Search tasks + users by keyword |

---

## Role & Permissions

| Action | User | Admin |
|---|:---:|:---:|
| Register / Login | ✅ | ✅ |
| Create / edit / delete own tasks | ✅ | ✅ |
| Add comments on tasks | ✅ | ✅ |
| Receive notifications | ✅ | ✅ |
| Update own profile | ✅ | ✅ |
| View other users' tasks | ❌ | ✅ |
| Delete any task | ❌ | ✅ |
| Assign tasks to users | ❌ | ✅ |
| View / manage all users | ❌ | ✅ |
| Activate / deactivate users | ❌ | ✅ |
| View activity logs | ❌ | ✅ |
| View analytics & charts | ❌ | ✅ |
| Global search | ❌ | ✅ |

> If an admin deactivates a user account, that user's existing JWT immediately stops working on the next request — `protect()` checks `status === 'active'` on every call, not just at login.

---

## Activity Logging

Every significant action is recorded in the `ActivityLog` collection:

| Field | Description |
|---|---|
| `user` | Reference to the User who triggered the action |
| `action` | Enum: `LOGIN`, `REGISTER`, `TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, `USER_STATUS_UPDATED`, `USER_DELETED` |
| `details` | Plain-English description |
| `ipAddress` | Request IP — useful for spotting suspicious logins |
| `createdAt` | Auto timestamp |

---

## Creating an Admin Account

Self-registration always assigns `role: "user"` — this is hardcoded on the server and cannot be overridden by the request body.

To promote a user to admin, update the record directly in MongoDB:

```js
// In mongosh or Atlas Data Explorer
use user_activity_rbac
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Then log in again to receive a new token with the updated role claim.

Alternatively, run the seed script — it creates an admin account automatically:
```bash
cd backend
node seedData.js
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Netlify | https://user-tracking-rbac-app.netlify.app |
| Backend API | Railway | https://useractivitytracking-production.up.railway.app |

- Backend deployed from the `backend/` directory on Railway with `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` env vars
- Frontend deployed from the `frontend/` directory on Netlify with `VITE_API_URL` pointing to the Railway backend
- `frontend/public/_redirects` handles React Router on Netlify (`/* /index.html 200`)
