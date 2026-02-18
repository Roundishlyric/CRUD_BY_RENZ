# User Management System by Renz

## Introduction

This project is a full-stack web application built using **React** for the frontend and **Node.js + MongoDB** for the backend.

The system allows administrators to:

* Manage users (Create, Update, Delete)
* View real-time system logs
* Track user activity
* Secure authentication using tokens
* Run the entire project using **Docker**

This project is designed as a simple admin dashboard demonstrating CRUD operations, logging, authentication, and containerized deployment.

---

## Tech Stack

### Frontend

* React
* React Router
* Axios
* React Hot Toast
* Font Awesome
* Custom Modal & Confirm Dialog Components

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

### DevOps

* Docker
* Docker Compose

---

## Features

### Authentication

* Login session stored via token
* Automatic logout when token expires

### User Management

* Add user
* Edit user
* Delete user
* View all users

### System Logs

* Logs every important action
* Shows who performed the action
* Shows record affected
* Shows timestamp
* Clear logs with confirmation

### UI/UX

* Dark themed admin dashboard
* Responsive layout
* Confirmation dialogs for critical actions
* Toast notifications for feedback

## Requirements

You must install:

* Docker
* Docker Compose

You DO NOT need Node or MongoDB locally because Docker will run them.

---

## Running the Project (Docker)

### 1. Clone the repository

```
git clone <your-repo-url>
cd <your-project-folder>
```

### 2. Build and start containers

```
docker compose up --build
```

### 3. Access the application

Frontend:

```
http://localhost:3000
```

Backend API:

```
http://localhost:8000
```

MongoDB:
Runs automatically inside Docker

---

## Stopping the Project

```
docker compose down
```

---

## Future Improvements

* Role based access (Admin / User)
* Pagination for logs
* Search & filters
* Export logs
* Dashboard analytics

---

## Author

Renz Danniel R. Rapanut

---

## License

This project is for educational purposes.
