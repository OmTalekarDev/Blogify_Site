# Blogify — Codomax Modules 1 & 2

A responsive blog application built as a **Frontend + Backend** internship project for Codomax Digital Solutions.

## Module 1 — Frontend

Built with HTML5, CSS3 and Vanilla JavaScript.

- Responsive Home / Explore page
- Login and Register UI
- Creator Dashboard
- Create Blog page
- Client-side validation
- Responsive navigation
- Local UI interactions

## Module 2 — Backend

A Node.js + Express REST API connected to the existing Blogify frontend.

### Backend capabilities

- User registration
- Password hashing with bcryptjs
- User login
- JWT authentication
- Protected blog endpoints
- Create published blogs
- Save drafts
- List current user's blogs
- Update own blogs
- Delete own blogs
- Public published-blog endpoint
- Health-check endpoint
- CORS and JSON request handling

### API routes

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | /api/health | API health check |
| POST | /api/auth/register | Register a user |
| POST | /api/auth/login | Login and receive JWT |
| GET | /api/blogs | List published blogs |
| GET | /api/blogs/my | List authenticated user's blogs |
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
├── css/
│   └── style.css
├── js/
│   └── app.js
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── data/
│   │   └── db.json
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── blogs.js
│   └── utils/
│       └── db.js
└── README.md
```

## How to Run

### 1. Install Node.js

Use a current LTS version of Node.js.

### 2. Install backend dependencies

Open a terminal in the `backend` folder:

```bash
npm install
```

### 3. Start the API

```bash
npm start
```

The app and API will be available at:

- http://localhost:5000
- http://localhost:5000/api/health

### 4. Test the application

Open http://localhost:5000 in your browser.

Register a new account, login, create a blog, save a draft, then open the dashboard to see the data returned from the backend.

## Data storage

For this internship project, data is persisted in `backend/data/db.json`. Passwords are stored as bcrypt hashes rather than plain text.

## Security note

The project uses a development JWT secret in code as a simple internship demonstration. For a real production deployment, the secret should be stored in an environment variable and additional security controls should be added.

## Internship

Developed for **Codomax Digital Solutions — Full Stack Web Development Internship, Module 1 and Module 2**.

## Author

**Om Talekar**

GitHub: https://github.com/OmTalekarDev
