# 🎓Campus Connect (Alumni Interaction Platform – Full Stack Web App)

A full-featured real-time platform that bridges the communication gap between students, alumni, and faculty. Built as a submission for the **Smart India Hackathon 2025**, this project demonstrates scalable backend design, secure authentication, and real-time WebSocket-powered chat and video calling.

---

## 🚀 Tech Stack

### Backend
- **Node.js**, **Express.js**
- **MongoDB** with **Mongoose**
- **JWT Authentication** with `bcrypt`
- **File Uploads**: `Cloudinary` + `Multer`
- **WebSockets**: `Socket.IO` for real-time messaging
- **Scheduling**: `node-cron`

### Frontend
- **React** with **Vite**
- **Tailwind CSS** for modern UI
- **Routing**: `react-router-dom`
- **Realtime**: `socket.io-client`, `peerjs` for video calls
- **Notifications**: `react-toastify`, `react-hot-toast`
- **Emoji & Icons**: `emoji-picker-react`, `lucide-react`, `react-icons`

---

## ✨ Features

- 🔐 **Role-based Auth**: Students, Alumni, Faculty
- 💬 **Realtime Chat**: One-to-one messaging using WebSockets
- 📹 **Video Calls**: Peer-to-peer communication using WebRTC via `peerjs`
- 🧵 **Feeds & Events**: Faculty can post campus events and updates
- 🎯 **Bounty Module**: Alumni can post tasks/bounties; students can apply and complete them
- 🖼 **Media Uploads**: Profile and document uploads via Cloudinary

---

## 🧩 Modules Overview

### `Users.controller.js`
- Register/Login users
- Role-based access (Student, Alumni, Faculty)

### `Alumni.controller.js`
- Alumni profile management
- Mentorship and bounty interactions

### `Bounty.controller.js`
- Create/Delete bounties
- Assign and track student submissions

### `Feed.controller.js`
- Post college updates and events
- Feed listing for all users

---

## 📁 Folder Structure

### Backend (`/backend`)
backend/
├── controllers/
│   ├── Alumni.controller.js
│   ├── Bounty.controller.js
│   ├── Feed.controller.js
│   └── Users.controller.js
├── models/
├── routes/
├── middlewares/
├── index.js
└── .env

### Frontend (`/newfrontend`)
newfrontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── context/
│   └── App.jsx
├── public/
└── tailwind.config.js

---



