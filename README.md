# ProDesk — Service Provider Onboarding Portal

A MERN stack application for onboarding service providers (electricians, plumbers, cleaners, etc.),
similar to Urban Company / ExtraHand. Providers register, complete their profile, upload documents,
and track their application status. Admins review, search/filter, and approve or reject applications
from a dashboard.

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcrypt password hashing, role-based access (provider / admin)
- **File uploads:** Multer (profile photo + verification documents)

## Project Structure

```
service-provider-portal/
├── backend/
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/          # User, Provider
│   │   ├── middleware/      # auth, role guard, multer upload, error handler
│   │   ├── controllers/     # auth, provider, admin
│   │   ├── routes/          # auth, provider, admin
│   │   ├── utils/           # asyncHandler, generateToken, seedAdmin
│   │   └── server.js
│   ├── uploads/              # uploaded photos & documents (served statically)
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/axios.js
│   │   ├── context/AuthContext.jsx
│   │   ├── components/      # TopBar, StatusBadge, PipelineTracker, ProviderDetailDrawer, etc.
│   │   ├── pages/            # Login, Register, ProviderDashboard, AdminDashboard
│   │   └── App.jsx
│   └── .env.example
└── postman_collection.json
```

## Features

**Service Provider**
- Register & login (JWT auth)
- Complete profile: phone, service categories, skills, experience, service location
- Upload profile photo & verification documents
- View application status with a visual onboarding pipeline tracker
- Edit profile — locked automatically once approved; a rejected profile can be edited and resubmits as "pending"

**Admin**
- Login (seeded admin account)
- Dashboard statistics (total / pending / approved / rejected)
- View all providers in a paginated, searchable, filterable table
- Search by name, email, phone, or city
- Filter by status and service category
- View a provider's full profile and uploaded documents
- Approve or reject applications, with required remarks on rejection

**Cross-cutting**
- Role-based access control & protected routes (frontend + backend)
- Centralized error handling & consistent JSON API responses
- Form validation (frontend + backend)
- Environment-variable based configuration
- Modular folder structure on both frontend and backend

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally, or a MongoDB Atlas connection string

### 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
# edit .env: set MONGO_URI, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, etc.

npm run seed:admin   # creates the default admin account from .env
npm run dev          # starts the API on http://localhost:5000
```

### 2. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
# defaults to VITE_API_URL=http://localhost:5000/api

npm run dev          # starts the app on http://localhost:5173
```

### 3. Log in

- **Provider:** register a new account from the app's Register page.
- **Admin:** use the email/password you set as `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`
  (default: `admin@portal.com` / `Admin@123`) after running `npm run seed:admin`.

## API Overview

All endpoints are prefixed with `/api`. See `postman_collection.json` for a ready-to-import Postman collection.

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new provider |
| POST | `/auth/login` | Public | Login (provider or admin) |
| GET | `/auth/me` | Private | Get current logged-in user |
| GET | `/provider/profile` | Provider | Get own profile |
| PUT | `/provider/profile` | Provider | Create/update profile |
| POST | `/provider/upload-photo` | Provider | Upload profile photo |
| POST | `/provider/upload-documents` | Provider | Upload verification documents |
| DELETE | `/provider/documents/:docId` | Provider | Remove an uploaded document |
| GET | `/provider/status` | Provider | Get application status |
| GET | `/admin/providers` | Admin | List providers (search, filter, paginate) |
| GET | `/admin/providers/:id` | Admin | Get single provider detail |
| PUT | `/admin/providers/:id/approve` | Admin | Approve provider |
| PUT | `/admin/providers/:id/reject` | Admin | Reject provider (requires `remarks`) |
| GET | `/admin/stats` | Admin | Dashboard statistics |

## Notes / Known Limitations

- Uploaded files are served from `/uploads` as static assets; in a production system these would
  sit behind signed URLs or an object store (S3, etc.) with per-user access checks.
- Email notifications, Google login, Docker, and Swagger docs are listed as bonus items in the
  assignment brief and are not implemented here to fit the time budget — see "Next steps" below.

## Next Steps (bonus, if time allows)

- Add Swagger/OpenAPI docs (`swagger-jsdoc` + `swagger-ui-express`)
- Add email notifications on approval/rejection (Nodemailer)
- Dockerize backend + frontend + MongoDB with `docker-compose`
- Deploy backend to Render/Railway and frontend to Vercel/Netlify
