# Blogify — Codomax Full Stack Internship

A modern responsive blog application built for the **Codomax Digital Solutions Full Stack Web Development Internship**.

## Module 1 — Frontend Development

- Responsive Home / Explore page
- Login and registration UI
- Creator Dashboard
- Create Blog page
- Client-side validation
- Light / Dark theme toggle
- Responsive navigation

## Module 2 — Backend Development

- Node.js + Express REST API
- User registration and login
- bcrypt password hashing
- JWT authentication
- Protected blog endpoints
- Create published blogs and drafts
- User-specific dashboard data
- Delete owned blogs
- Frontend ↔ backend API integration

## Module 3 — Database Integration

The application is upgraded to use **MongoDB through Mongoose**.

### Database work

- MongoDB connection through an environment variable
- Mongoose User and Blog schemas
- Unique user email index
- User passwords stored only as bcrypt hashes
- Blog documents stored with author references
- Published blogs retrieved from MongoDB
- Authenticated user's blogs retrieved from MongoDB
- Individual public blog details page
- MongoDB-backed blog creation, updates and deletion
- Database connection health reporting

### API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/health | API and database health check |
| POST | /api/auth/register | Register a user |
| POST | /api/auth/login | Login and receive JWT |
| GET | /api/auth/me | Get authenticated user |
| GET | /api/blogs | Retrieve published blogs |
| GET | /api/blogs/my | Retrieve current user's blogs |
| GET | /api/blogs/:id | Retrieve an individual published blog |
| POST | /api/blogs | Create a published blog or draft |
| PUT | /api/blogs/:id | Update an owned blog |
| DELETE | /api/blogs/:id | Delete an owned blog |

## Project Structure

```text
Codomax-Module-1-Blog/
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

### 1. Install Node.js

Use a current LTS version.

### 2. Configure MongoDB

Create a MongoDB deployment (MongoDB Atlas or a local MongoDB server).

In `backend/`, copy:

```text
.env.example → .env
```

Set:

```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-long-random-secret
```

Never commit the real `.env` file.

### 3. Install dependencies

```bash
cd backend
npm install
```

### 4. Start the application

```bash
npm start
```

Open:

- http://localhost:5000
- http://localhost:5000/api/health

### 5. Test Module 3

Register a user, log in, create a blog, save a draft, open the dashboard and then open a published story through **Read article →**.

## Security Notes

- MongoDB credentials are loaded from environment variables.
- `.env` is ignored by Git.
- Passwords are hashed with bcrypt before persistence.
- JWT signing uses an environment-provided secret.
- Private blog management routes require JWT authentication.

## Internship

Developed for **Codomax Digital Solutions — Full Stack Web Development Internship, Modules 1–3**.

## Author

**Om Talekar**

GitHub: https://github.com/OmTalekarDev
