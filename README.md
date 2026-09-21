# Blogify Codomax Full Stack Internship

A modern responsive blog application built for the **Codomax Digital Solutions Full Stack Web Development Internship**.

## Module 1 Frontend Development

- Responsive Home / Explore page
- Login and registration UI
- Creator Dashboard
- Create Blog page
- Client-side validation
- Light / Dark theme toggle
- Responsive navigation

## Module 2 Backend Development

- Node.js + Express REST API
- User registration and login
- bcrypt password hashing
- JWT authentication
- Protected blog endpoints
- Create published blogs and drafts
- User-specific dashboard data

## Module 3 Database Integration

The application uses **MongoDB through Mongoose**.

- MongoDB connection through an environment variable
- Mongoose User and Blog schemas
- Unique user email index
- User passwords stored only as bcrypt hashes
- Blog documents stored with author references
- Published blogs retrieved from MongoDB
- Authenticated user's blogs retrieved from MongoDB
- Individual public blog details page

## Module 4 CRUD Operations

The Blogify dashboard now provides the complete CRUD workflow:

- **Create** — publish a new blog or save a draft
- **Read** — retrieve and display published blogs and the authenticated user's blogs
- **Update** — edit an owned blog and save the changes through the API
- **Delete** — permanently delete an owned blog after confirmation
- Search blogs by title, description, category or tags
- Filter stories by All, Published and Draft status
- View published stories directly from the dashboard
- Responsive CRUD controls with light / dark theme support

### CRUD API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/blogs | Retrieve published blogs |
| GET | /api/blogs/my | Retrieve current user's blogs |
| GET | /api/blogs/:id | Retrieve an individual published blog |
| POST | /api/blogs | Create a published blog or draft |
| PUT | /api/blogs/:id | Update an owned blog |
| DELETE | /api/blogs/:id | Delete an owned blog |

## Module 5 Authentication & Dashboard

The application now includes a protected account and dashboard workflow:

- JWT authentication is verified against the backend for private pages
- Private Dashboard and Create Blog pages redirect unauthenticated users to Login
- `GET /api/auth/me` verifies the current JWT and returns the signed-in user's profile
- Dashboard displays the authenticated user's account details
- Dedicated Profile page shows account information and session status
- Logout clears the client-side JWT and user session data
- User-specific blog data remains protected through authenticated API routes


## Project Structure

```text
Blogify_Site/
├── index.html
├── login.html
├── register.html
├── dashboard.html
├── create-blog.html
├── blog.html
├── css/
│   ├── style.css
│   └── theme.css
├── js/
│   ├── app.js
│   └── theme.js
└── backend/
    ├── package.json
    ├── server.js
    ├── .env.example
    ├── .gitignore
    ├── config/
    │   └── db.js
    ├── models/
    │   ├── User.js
    │   └── Blog.js
    ├── middleware/
    │   └── auth.js
    └── routes/
        ├── auth.js
        └── blogs.js
```

## How to Run

### 1. Configure MongoDB

In `backend/`, create `.env` from `.env.example` and set your private MongoDB URI and JWT secret.

Never commit the real `.env` file.

### 2. Install dependencies

```bash
cd backend
npm install
```

### 3. Start the application

```bash
npm start
```

Then open:

- http://localhost:5000
- http://localhost:5000/api/health

## Verify CRUD Features

After the application is running:

1. Register or log in.
2. Create and publish a blog.
3. Save another blog as a draft.
4. Open the Dashboard and use **Edit** to update a story.
5. Use **View** to open a published story.
6. Use **Delete** to remove an owned story.
7. Search by title, description, category or tags and switch between status filters.

## Security Notes

- MongoDB credentials are loaded from environment variables.
- `.env` is ignored by Git.
- Passwords are hashed with bcrypt before persistence.
- JWT signing uses an environment-provided secret.
- Blog update/delete routes require JWT authentication and ownership.

## Module 6 — Final Project & Deployment

Module 6 prepares Blogify for a production-style deployment:

- Production-ready relative API URLs for the frontend
- Express server binds to `0.0.0.0` for public hosting
- Dedicated Render deployment configuration in `render.yaml`
- Health check available at `/api/health`
- Environment variables kept outside the repository
- Final UI, authentication, dashboard, CRUD and blog-detail workflows consolidated in one full-stack project

### Deploy on Render

1. Create a **Web Service** from this GitHub repository.
2. Set the **Root Directory** to `backend`.
3. Use **Build Command**: `npm install`.
4. Use **Start Command**: `npm start`.
5. Add `MONGODB_URI` and `JWT_SECRET` as environment variables.
6. Deploy and verify `https://<your-service>.onrender.com/api/health`.
7. Use the generated `onrender.com` URL as the Live Website Link for the internship submission.

Render supports Express/Node web services, build and start commands, health checks, and runtime environment variables. See the official Render documentation for the current setup flow.


## Internship

Developed for **Codomax Digital Solutions — Full Stack Web Development Internship, Modules 1–5**.

## Author

**Om Talekar**

GitHub: https://github.com/OmTalekarDev
