# GeoTime HR — Backend API

## Overview

- HR Attendance & Geofencing REST API
- Stack: Node.js 20 + Express 4 + MongoDB Atlas + Firebase FCM + Cloudinary
- Hosted on Render (free tier)

## Features

- ✅ Multi-tenant architecture (orgId isolation)
- ✅ GPS Geofence validation (Haversine formula)
- ✅ JWT Auth + RBAC (EMPLOYEE / HR / MANAGER)
- ✅ Check-in / Check-out with late minutes calculation
- ✅ Requests system (Correction / Leave / Expense / Overtime)
- ✅ Firebase push notifications
- ✅ Monthly timesheets + CSV export
- ✅ Cron job — auto-flag missing checkouts at midnight

## Project Structure

```text
geotimehr-backend/
├── config/        # Environment, constants, DB connection
├── controllers/   # Request handlers (business logic delegation)
├── middleware/    # Auth, RBAC, tenant isolation, validation, errors
├── models/        # Mongoose schemas (Tenant-aware)
├── routes/        # Express routers
├── services/      # Core business logic (attendance, notifications)
├── utils/         # Helpers (response, pagination, dates)
├── validators/    # Joi validation schemas
├── app.js         # Express app config
└── server.js      # DB connect & server start
```

## Environment Variables

| Variable                | Required | Description                                              |
| ----------------------- | -------- | -------------------------------------------------------- |
| `PORT`                  | Yes      | Port number to run the server on (default: 3000)         |
| `NODE_ENV`              | Optional | Current environment (`development`, `production`)        |
| `MONGODB_URI`           | Yes      | MongoDB Atlas connection string                          |
| `JWT_SECRET`            | Yes      | Secret key used for signing JWT tokens                   |
| `JWT_EXPIRES_IN`        | Yes      | Token expiration time (e.g., `7d`)                       |
| `CLOUDINARY_CLOUD_NAME` | Optional | Cloudinary cloud name for media uploads                  |
| `CLOUDINARY_API_KEY`    | Optional | Cloudinary API key                                       |
| `CLOUDINARY_API_SECRET` | Optional | Cloudinary API secret                                    |
| `FIREBASE_PROJECT_ID`   | Optional | Firebase project ID for push notifications               |
| `FIREBASE_PRIVATE_KEY`  | Optional | Firebase service account private key                     |
| `FIREBASE_CLIENT_EMAIL` | Optional | Firebase service account client email                    |
| `CLIENT_URL`            | Optional | Allowed client origin for CORS (`http://localhost:3000`) |

## Local Development

### Prerequisites

- Node.js 20+
- MongoDB Atlas account (free M0 tier)
- Firebase project (for push notifications)
- Cloudinary account (for file uploads)

### Setup Steps

1. Clone repo
2. `npm install`
3. Copy `.env.example` to `.env` and fill values
4. `npm run dev`

### Available Scripts

- `npm run dev` → nodemon (development)
- `npm start` → node server.js (production)

## API Base URL

- **Local:** `http://localhost:3000/api`
- **Production:** `https://geotimehr-api.onrender.com/api`

## Authentication

This API uses standard JWT Bearer token authentication.
Provide the issued token in the HTTP `Authorization` header:
`Authorization: Bearer <token>`

## API Endpoints Summary

| Method                   | Endpoint                       | Auth        | Description                                              |
| ------------------------ | ------------------------------ | ----------- | -------------------------------------------------------- |
| **🔐 Auth (3)**          |                                |             |                                                          |
| POST                     | `/api/auth/register-org`       | Public      | Register a new organization and first HR admin           |
| POST                     | `/api/auth/login`              | Public      | Authenticate a user to get JWT token                     |
| GET                      | `/api/auth/me`                 | Bearer      | Get the currently authenticated user details             |
| **👥 Users (6)**         |                                |             |                                                          |
| GET                      | `/api/users`                   | Bearer (HR) | List employees with optional filters/search              |
| POST                     | `/api/users`                   | Bearer (HR) | Create a new employee                                    |
| GET                      | `/api/users/me/profile`        | Bearer      | Get current user's profile                               |
| PATCH                    | `/api/users/me/profile`        | Bearer      | Update current user's profile                            |
| GET                      | `/api/users/:id`               | Bearer (HR) | Get an employee's details by ID                          |
| PUT                      | `/api/users/:id`               | Bearer (HR) | Update an employee's details                             |
| DELETE                   | `/api/users/:id`               | Bearer (HR) | Soft-delete an employee                                  |
| **📍 Locations (5)**     |                                |             |                                                          |
| GET                      | `/api/locations`               | Bearer      | List geofenced locations                                 |
| POST                     | `/api/locations`               | Bearer (HR) | Create a new location                                    |
| PUT                      | `/api/locations/:id`           | Bearer (HR) | Update an existing location                              |
| PATCH                    | `/api/locations/:id/toggle`    | Bearer (HR) | Toggle location active/inactive status                   |
| DELETE                   | `/api/locations/:id`           | Bearer (HR) | Delete a location (if no attendances linked)             |
| **⏰ Shifts (4)**        |                                |             |                                                          |
| GET                      | `/api/shifts`                  | Bearer (HR) | List available work shifts                               |
| POST                     | `/api/shifts`                  | Bearer (HR) | Create a new shift                                       |
| PUT                      | `/api/shifts/:id`              | Bearer (HR) | Update an existing shift                                 |
| DELETE                   | `/api/shifts/:id`              | Bearer (HR) | Archive a shift (if no active employees)                 |
| **🗓️ Attendance (3)**    |                                |             |                                                          |
| POST                     | `/api/attendance/checkin`      | Bearer      | Check-in at the current GPS location                     |
| POST                     | `/api/attendance/checkout`     | Bearer      | Check-out at the current GPS location                    |
| GET                      | `/api/attendance/today`        | Bearer      | Get the current day's attendance status                  |
| **📅 History (3)**       |                                |             |                                                          |
| GET                      | `/api/history`                 | Bearer      | Get the current user's attendance history                |
| GET                      | `/api/history/monthly-summary` | Bearer      | Get the user's monthly attendance summary                |
| GET                      | `/api/history/user/:userId`    | Bearer (HR) | View a specific employee's attendance history            |
| **📝 Requests (5)**      |                                |             |                                                          |
| GET                      | `/api/requests`                | Bearer      | Get current user's submitted requests                    |
| POST                     | `/api/requests`                | Bearer      | Submit a new request (Correction/Leave/Expense/Overtime) |
| GET                      | `/api/requests/admin/pending`  | Bearer (HR) | View pending requests awaiting review                    |
| GET                      | `/api/requests/:id`            | Bearer      | View details of a specific request                       |
| PATCH                    | `/api/requests/:id/review`     | Bearer (HR) | Review (approve/reject) a specific request               |
| **🔔 Notifications (3)** |                                |             |                                                          |
| GET                      | `/api/notifications`           | Bearer      | Get user notifications with unread count                 |
| PATCH                    | `/api/notifications/read-all`  | Bearer      | Mark all notifications as read                           |
| PATCH                    | `/api/notifications/:id/read`  | Bearer      | Mark a specific notification as read                     |
| **📊 Dashboard (2)**     |                                |             |                                                          |
| GET                      | `/api/dashboard/stats`         | Bearer (HR) | Get aggregate HR statistics for the day                  |
| GET                      | `/api/dashboard/live`          | Bearer (HR) | Get live active check-in sessions                        |
| **📈 Reports (4)**       |                                |             |                                                          |
| GET                      | `/api/reports/timesheet`       | Bearer (HR) | View monthly timesheet statistics                        |
| GET                      | `/api/reports/export-csv`      | Bearer (HR) | Download monthly timesheet as a CSV file                 |
| GET                      | `/api/reports/trends`          | Bearer (HR) | Get weekly average hours insights                        |
| GET                      | `/api/reports/late-report`     | Bearer (HR) | Get employee rankings for tardiness                      |

## Deployment on Render

### Steps:

1. Push code to GitHub
2. Go to render.com → New Web Service
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add all environment variables from `.env.example`
7. Deploy

### Render Free Tier Notes:

- Service spins down after 15min inactivity
- Cold start: ~30 seconds
- Use UptimeRobot (free) to ping `/api/health` every 14min to keep service alive

### Cron Job on Render:

- Go to Render → New Cron Job
- Command: `node -e "require('./services/cron.service').initCronJobs()"`
- Schedule: `0 0 * * *` (midnight daily)

## MongoDB Atlas Setup

1. Create free M0 cluster
2. Create database user
3. Whitelist IP: `0.0.0.0/0` (for Render)
4. Get connection string → `MONGODB_URI` in `.env`

## Firebase Setup

1. Create Firebase project
2. Go to Project Settings → Service Accounts
3. Generate new private key → download JSON
4. Copy values to `.env`:
   `FIREBASE_PROJECT_ID`
   `FIREBASE_PRIVATE_KEY`
   `FIREBASE_CLIENT_EMAIL`

## Postman Collection

Import `GeoTimeHR.postman_collection.json`
Set environment variable: `baseUrl` + `token`

## Error Codes Reference

| Code                 | HTTP Status | Description                   |
| -------------------- | ----------- | ----------------------------- |
| `OUTSIDE_GEOFENCE`   | 403         | User outside workplace radius |
| `ALREADY_CHECKED_IN` | 409         | Active session exists today   |
| `NO_ACTIVE_SESSION`  | 404         | No open check-in found        |
| `VALIDATION_ERROR`   | 422         | Invalid request body          |
| `TENANT_VIOLATION`   | 403         | Cross-org access attempt      |

## License

MIT
