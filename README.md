# 🌺 Afrahna wedding olatform Server side – API

This is a backend server built with **Node.js**, **Express**, and **MongoDB**, supporting a booking platform with features like user management, messaging, video handling, and more. It uses `dotenv` for environment configuration, `helmet` and `cors` for security, and custom logging utilities.

---

## Features

> RESTful API using **Express** > **MongoDB** integration with **Mongoose** > **GridFS** support for file uploads (via Multer)
> Role-based routing: business users, general users, services, bookings, messages, and videos

> **Security** with Helmet and CORS

> **Logging** with `chalk` and custom logger
> **Environment-specific config** loading
> Automatically logs available routes in development mode

---

## ⚙️ Setup Instructions

### 1. Clone and Install

```bash
git clone <repo-url>
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` and `.env.production` file at the root.

Example `.env` (for development):

```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/yourdbname
```

---

## Running the Server

### Development Mode

```bash
npm run dev
```

> Loads `.env`
> Watches for file changes
> Logs available API routes with `express-list-routes`

### Production Mode

```bash
npm run start
```

> Loads `.env.production`

---

## 🔐 Middleware Stack

> `express.json()` – Parses JSON bodies
> `cors()` – Cross-Origin Resource Sharing
> `helmet()` – Sets secure HTTP headers
> `logger` – Custom request logger
> `logToFile()` – Writes logs to disk

---

## 🌐 Available Routes

| Route Prefix    | Description            |
| --------------- | ---------------------- |
| `/api/business` | Business user routes   |
| `/api/users`    | General user routes    |
| `/api/services` | Service-related routes |
| `/api/bookings` | Booking endpoints      |
| `/api/messages` | Messaging system       |
| `/api/videos`   | Video management       |

> Run `npm run dev` to see full route list with HTTP methods and paths.

---

## 🌍 CORS Configuration

Allowed origins:

> `http://localhost:5173`

> `https://client-afrahna.vercel.app`

---

## 🪵 Logging

> All requests are logged via a custom `logger` middleware
> Logs can be saved to a file using `logToFile()`

---

## 🧪 Testing

Currently, there's no test setup. You can add tools like **Jest**, **Supertest**, or **Mocha** based on your preferences.

---

## 📄 License

This project is licensed under the **MIT License**.

---
