# 🕐 GeoTime HR — Backend API

HR Attendance & Geofencing REST API built with Node.js, Express, and MongoDB.

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express 4
- **Database:** MongoDB Atlas (Mongoose 8)
- **Auth:** JWT (jsonwebtoken + bcryptjs)
- **Notifications:** Firebase Admin SDK
- **Security:** Helmet, CORS, express-rate-limit

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB Atlas cluster (or local MongoDB)

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/geotimehr-backend.git
cd geotimehr-backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your actual values

# Start development server
npm run dev
```

### Environment Variables

See [`.env.example`](.env.example) for all required variables.

## API Endpoints

| Method | Endpoint      | Description  |
| ------ | ------------- | ------------ |
| GET    | `/api/health` | Health check |

> More endpoints coming soon as features are built out.

## Scripts

| Command       | Description                   |
| ------------- | ----------------------------- |
| `npm start`   | Start production server       |
| `npm run dev` | Start dev server with nodemon |

## License

ISC
