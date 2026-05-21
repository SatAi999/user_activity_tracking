# TaskFlow — Role-Based Task Management with Activity Tracking

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue)

TaskFlow is a full-stack task management application with a proper two-tier access system. Regular users get a clean personal task board. Admins get a separate control panel with visibility into every user, every task, and a timestamped log of everything that's happened in the system.

The access control is enforced at the API layer — not just hidden buttons in the UI. Hit an admin endpoint without the right role and you get a `403` back, regardless of what the frontend looks like.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Role & Permissions](#role--permissions)
- [Activity Logging](#activity-logging)
- [Creating an Admin Account](#creating-an-admin-account)
- [Git Workflow](#git-workflow)

---

## Features

**For regular users**
- Register and log in with JWT-based authentication
- Create tasks with a title, description, priority (low / medium / high), and status
- Edit and delete your own tasks
- Filter task list by status — pending, in-progress, or completed
- Deactivated accounts are blocked at login — they can't get a token at all

**For admins**
- Analytics dashboard showing total users, total tasks, and a breakdown by status
- Full user list with the ability to toggle any account active/inactive or delete it entirely
- View all tasks across every user in the system, with search and status filters
- Delete any task regardless of who created it
- Activity log showing the last 200 events, filterable by action type and searchable by user

**System-wide**
- All sensitive routes are protected with JWT middleware
- Admin routes have a second guard — authenticated but non-admin users still get blocked
- Every meaningful action (login, registration, task CRUD, user management) is recorded to an audit log with user, timestamp, IP address, and a plain-English description

---

## Tech Stack

**Backend**

| Package | Purpose |
|---|---|
| Express 4 | HTTP server and routing |
| Mongoose 8 | MongoDB ODM |
| jsonwebtoken | Signing and verifying JWTs |
| bcryptjs | Password hashing (10 salt rounds) |
| express-validator | Request body validation |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

**Frontend**

| Package | Purpose |
|---|---|
| React 19 + Vite | UI framework and dev server |
| React Router v7 | Client-side routing |
| Axios | HTTP client with interceptors |
| Tailwind CSS v4 | Utility-first styling |
| react-hot-toast | Non-blocking notifications |
| react-icons | Icon set (Feather icons) |

---

## Project Structure

```
User_Activity_RBAC/
│
├── backend/
│   ├── config/
│   │   └── db.js                    # Mongoose connection with error handling
│   │
│   ├── controllers/
│   │   ├── authController.js        # register, login, getMe
│   │   ├── taskController.js        # getTasks, createTask, updateTask, deleteTask
│   │   └── adminController.js       # getAllUsers, deleteUser, updateUserStatus,
│   │                                #   getAllTasks, adminDeleteTask,
│   │                                #   getActivityLogs, getAnalytics
│   │
│   ├── middleware/
│   │   └── auth.js                  # protect() — verifies JWT + checks active status
│   │                                # adminOnly() — checks role === 'admin'
│   │
│   ├── models/
│   │   ├── User.js                  # name, email, password (hashed), role, status
│   │   ├── Task.js                  # title, description, status, priority, user ref
│   │   └── ActivityLog.js           # user ref, action enum, details, ipAddress
│   │
│   ├── routes/
│   │   ├── auth.js                  # POST /register, POST /login, GET /me
│   │   ├── tasks.js                 # GET /, POST /, PUT /:id, DELETE /:id
│   │   └── admin.js                 # /analytics, /users, /tasks, /logs
│   │
│   ├── .env.example
│   └── server.js                    # Express setup, CORS, route mounting, error handler
│
└── frontend/
    ├── index.html
    ├── vite.config.js               # Vite + Tailwind plugin + /api proxy to :5000
    └── src/
        ├── api/
        │   └── axios.js             # Axios instance — attaches Bearer token on every
        │                            # request, redirects to /login on 401
        │
        ├── context/
        │   └── AuthContext.jsx      # Stores user + token, exposes login/register/logout
        │
        ├── components/
        │   ├── Navbar.jsx           # Shows admin nav links only when role === 'admin'
        │   ├── ProtectedRoute.jsx   # Redirects to /login if no token
        │   └── AdminRoute.jsx       # Redirects to /dashboard if role !== 'admin'
        │
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx        # Welcome screen with role-aware quick links
            ├── Tasks.jsx            # Personal task board with modal form
            └── admin/
                ├── AdminDashboard.jsx    # Stat cards + task status breakdown bar
                ├── UserManagement.jsx    # Table with toggle and delete per user
                ├── TaskMonitoring.jsx    # All tasks with search + status filter
                └── ActivityLogs.jsx      # Audit trail with action type filter
```

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB running locally, or a free [MongoDB Atlas](https://cloud.mongodb.com) cluster

### 1. Clone the repo

```bash
git clone https://github.com/SatAi999/user_activity_tracking.git
cd user_activity_tracking
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set your values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/user_activity_rbac
JWT_SECRET=replace_this_with_a_long_random_string
JWT_EXPIRE=7d
```

If you're on Atlas, replace `MONGO_URI` with the connection string from the Atlas dashboard. Make sure you've whitelisted your IP under **Network Access**.

Start the dev server:

```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
```

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The Vite config proxies all `/api/*` requests to `http://localhost:5000` so you don't need to deal with CORS in development.

---

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `PORT` | No | `5000` | Port the Express server listens on |
| `MONGO_URI` | Yes | — | Local or Atlas connection string |
| `JWT_SECRET` | Yes | — | Should be at least 32 random characters |
| `JWT_EXPIRE` | No | `7d` | Any value accepted by `jsonwebtoken` (e.g. `1d`, `2h`) |

Never commit your `.env` file. The `.gitignore` already excludes it — `.env.example` is what's tracked in the repo.

---

## API Reference

Base URL: `http://localhost:5000/api`

All protected routes expect an `Authorization: Bearer <token>` header.

### Authentication

| Method | Route | Protected | Description |
|---|---|---|---|
| `POST` | `/auth/register` | No | Creates a new user. Returns user object + JWT. |
| `POST` | `/auth/login` | No | Validates credentials. Returns user object + JWT. |
| `GET` | `/auth/me` | Yes | Returns the currently authenticated user. |

**Register / Login request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response (both):**
```json
{
  "_id": "664a...",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "status": "active",
  "token": "eyJhbGci..."
}
```

---

### Tasks (user-scoped)

| Method | Route | Description |
|---|---|---|
| `GET` | `/tasks` | Returns all tasks belonging to the logged-in user, sorted newest first |
| `POST` | `/tasks` | Creates a new task. `title` is required. `priority` defaults to `medium`. |
| `PUT` | `/tasks/:id` | Updates fields on a task. Users can only update their own tasks. |
| `DELETE` | `/tasks/:id` | Deletes a task. Users can only delete their own tasks. |

**Create / update task body:**
```json
{
  "title": "Write unit tests",
  "description": "Cover auth middleware and task controller",
  "priority": "high",
  "status": "in-progress"
}
```

---

### Admin

All routes require both a valid JWT **and** `role: "admin"`. Any other authenticated user gets a `403 Access denied: Admins only`.

| Method | Route | Description |
|---|---|---|
| `GET` | `/admin/analytics` | Returns counts: totalUsers, totalTasks, completedTasks, pendingTasks, inProgressTasks |
| `GET` | `/admin/users` | Returns all users sorted by registration date |
| `DELETE` | `/admin/users/:id` | Deletes the user and all their tasks. Cannot delete your own account. |
| `PATCH` | `/admin/users/:id/status` | Sets status to `active` or `inactive`. Body: `{ "status": "inactive" }` |
| `GET` | `/admin/tasks` | Returns all tasks, populated with the owning user's name and email |
| `DELETE` | `/admin/tasks/:id` | Deletes any task in the system |
| `GET` | `/admin/logs` | Returns the 200 most recent activity log entries, newest first |

---

## Role & Permissions

| Action | User | Admin |
|---|:---:|:---:|
| Register / Login | ✅ | ✅ |
| Create tasks | ✅ | ✅ |
| View own tasks | ✅ | ✅ |
| Edit own tasks | ✅ | ✅ |
| Delete own tasks | ✅ | ✅ |
| View other users' tasks | ❌ | ✅ |
| Delete any task | ❌ | ✅ |
| View all users | ❌ | ✅ |
| Activate / deactivate users | ❌ | ✅ |
| Delete users | ❌ | ✅ |
| View activity logs | ❌ | ✅ |
| View analytics | ❌ | ✅ |

One thing worth noting: if an admin deactivates a user account, that user's existing token will also stop working on the next request — the `protect` middleware checks `status === 'active'` on every call, not just at login.

---

## Activity Logging

The `ActivityLog` collection records every significant action. Each document stores:

- `user` — reference to the User who triggered the action
- `action` — one of the enum values below
- `details` — a plain-English string describing what happened
- `ipAddress` — the request IP (useful for spotting suspicious logins)
- `createdAt` — automatic timestamp

| Action constant | When it's recorded |
|---|---|
| `REGISTER` | New user signs up |
| `LOGIN` | Successful login |
| `TASK_CREATED` | User creates a task |
| `TASK_UPDATED` | User updates a task |
| `TASK_DELETED` | User or admin deletes a task |
| `USER_STATUS_UPDATED` | Admin changes a user's active/inactive status |
| `USER_DELETED` | Admin deletes a user account |

Logs are never deleted automatically. The admin logs endpoint returns the 200 most recent entries. If you need pagination, the query in `adminController.js` is straightforward to extend.

---

## Creating an Admin Account

The registration endpoint always assigns `role: "user"`. To make someone an admin, update the record directly in the database:

```bash
# Using mongosh
use user_activity_rbac
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

After that, log in again to get a new token — the old token still has the old role claim baked into it.

If you're on Atlas, you can do the same update through the Atlas Data Explorer UI.

---

## Git Workflow

This project was built on a feature branch and merged via pull request:

```
main
└── feature/rbac-activity-tracking   ← all development happened here
         │
         └──► Pull Request #1 → merged into main
```

- `main` holds only stable, merged code
- No direct commits to `main` during development
- PR was kept open until the implementation was complete, then merged with no conflicts

