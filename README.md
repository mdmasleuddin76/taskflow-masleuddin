# TaskFlow

![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-4169E1?logo=postgresql)

TaskFlow is a simple and fast task management system where users can create projects, manage tasks, and track progress easily. It is built with a focus on performance, clean design, and real-world production setup.

---

## 🌐 Live Demo (Production)

## 👉 **https://maslecodes.fun**

<br>
> Deployed on a VPS using Docker and Nginx with HTTPS enabled.

---

This project includes:

* Secure JWT authentication
* PostgreSQL database with raw SQL queries
* Fast UI with instant updates
* Fully containerized setup using Docker

---

## 1. Overview

TaskFlow allows users to seamlessly create projects, manage tasks, and track status across their workspace.

**Tech Stack:**

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL (Raw SQL queries via `pg`, zero ORM magic)
* **Frontend:** React (Vite), React Router, Tailwind CSS, Lucide React (Icons)
* **Infrastructure:** Docker, Docker Compose, Nginx (Multi-stage builds)

---

## 2. Architecture Decisions

I built this application focusing on performance, good user experience, and making it ready for real-world use.

* **Node.js over Go:** The assignment suggested Go, but I used Node.js because I am more comfortable with JavaScript. This helped me build faster and focus more on solving problems, improving the UI, and handling real-world scenarios within the limited time.

* **Raw SQL over ORM:** I did not use ORMs like Prisma or Sequelize. Instead, I wrote raw SQL queries using `pg`. This gave me better control over queries, performance, and database design, and also helped me understand how things work internally.

* **Optimistic UI Updates:** When a user updates a task (like marking it as done), the UI updates instantly before the backend response comes. If something fails, it rolls back. This makes the app feel very fast and smooth.

* **Nginx & Docker Setup:** I used Docker to containerize the application and Nginx to serve the frontend and handle API requests. This setup is closer to how real production systems work.

* **Global API Error Handling:** I used Axios interceptors to handle errors in one place. For example, if the token expires (401 error), the user is automatically logged out and redirected to login. This keeps the app clean and avoids repeating error handling everywhere.


---

## 3. Running Locally

The application is fully containerized. You only need Docker installed on your machine—no local Node or Postgres installation required.

```bash
# 1. Clone the repository
git clone https://github.com/mdmasleuddin76/taskflow-masleuddin.git
cd taskflow-masleuddin

# 2. Set up environment variables
cp .env.example .env

# 3. Spin up the infrastructure
docker compose up --build
```

### Access Services

* Frontend: http://localhost:3000
* Backend API: http://localhost:4000
* Database: localhost:5432

---

## 4. Running Migrations

Zero manual steps are required.

The `docker-compose.yml` file maps the local `./BACKEND/migrations` directory directly to PostgreSQL's `/docker-entrypoint-initdb.d` volume. When the database container starts for the first time, it automatically executes all `.sql` files in alphabetical order, constructing the schema and seeding the initial test data before the backend server boots.

---

## 5. Test Credentials

The automated seed script creates a default user and populates a sample project so you can bypass registration and evaluate the dashboard immediately.

* Email: `test@example.com`
* Password: `password123`

---

## 6. API Reference

All protected endpoints require the `Cookies` token. Passwords are cryptographically hashed using bcrypt (Cost factor 12).

### Authentication

| Method | Endpoint       | Description                            |
| ------ | -------------- | -------------------------------------- |
| POST   | /auth/register | Register a new user                    |
| POST   | /auth/login    | Authenticate and receive a 24-hour JWT |

### Projects

| Method | Endpoint      | Description                                          |
| ------ | ------------- | ---------------------------------------------------- |
| GET    | /projects     | List all accessible projects                         |
| POST   | /projects     | Create a new project                                 |
| GET    | /projects/:id | Fetch project details and its tasks                  |
| PATCH  | /projects/:id | Update project metadata (Owner only)                 |
| DELETE | /projects/:id | Delete project and cascade delete tasks (Owner only) |

### Tasks

| Method | Endpoint            | Description                                            |
| ------ | ------------------- | ------------------------------------------------------ |
| GET    | /projects/:id/tasks | List tasks (Supports ?status= and ?assignee= filters)  |
| POST   | /projects/:id/tasks | Create a new task                                      |
| PATCH  | /tasks/:id          | Update task status, priority, assignee, due date, etc. |
| DELETE | /tasks/:id          | Remove a task (Owner only)                             |

---

## 7. What I'd Do With More Time

While the core constraints are met, no software is ever truly "finished". Given more time, I would implement:

* Comprehensive Testing: Add Unit tests (Jest/Vitest) and E2E tests (Cypress/Playwright)
* Real-time Synchronization: WebSockets (Socket.io) or SSE
* Advanced Drag-and-Drop: Kanban board
* Caching Layer: Redis for high-read endpoints
* Security Hardening: express-rate-limit and helmet

---