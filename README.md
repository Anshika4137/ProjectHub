
# 🗂️ ProjectHub - Project Management Tool

![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Socket.io-RealTime-black?style=for-the-badge&logo=socket.io)

> A full-stack collaborative Project Management Tool built with MERN Stack — similar to Trello/Asana. Built as part of **CodeAlpha Full Stack Development Internship**.

---

## 🌟 Features

- 🔐 **User Authentication** — Register & Login with JWT
- 🗂️ **Project Boards** — Create and manage group projects
- 👥 **Team Collaboration** — Add members to projects via email
- ✅ **Kanban Board** — Drag & drop tasks (Todo / In Progress / Done)
- 📌 **Task Assignment** — Assign tasks to team members
- 💬 **Comments** — Comment on tasks with username display
- 🔔 **Real-time Notifications** — Socket.io powered live updates
- 👑 **Role System** — Owner & Member roles
- 📱 **Responsive UI** — Built with Tailwind CSS

---

## 🛠️ Tech Stack

### Frontend
| Technology | Usage |
|---|---|
| React 19 + Vite | Frontend Framework |
| Tailwind CSS | Styling |
| React Router DOM | Navigation |
| Axios | API Calls |
| @hello-pangea/dnd | Drag & Drop |
| Socket.io Client | Real-time |

### Backend
| Technology | Usage |
|---|---|
| Node.js | Runtime |
| Express.js | Server Framework |
| MongoDB + Mongoose | Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| Socket.io | WebSockets |

---

## 📁 Project Structure

```
CodeAlpha_ProjectManagement/
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── CommentSection.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── Board.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── App.jsx
├── server/                  # Node.js Backend
│   ├── models/
│   │   ├── User.js
│   │   ├── Project.js
│   │   └── Task.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── projects.js
│   │   └── tasks.js
│   ├── middleware/
│   │   └── auth.js
│   └── server.js
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js installed
- MongoDB Atlas account
- Git installed

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/CodeAlpha_ProjectManagement.git
cd CodeAlpha_ProjectManagement
```

### 2. Setup Backend
```bash
cd server
npm install
```

Create `.env` file in server folder:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

Run backend:
```bash
npm run dev
```

### 3. Setup Frontend
```bash
cd client
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🚀 Usage

1. **Register** a new account
2. **Login** with your credentials
3. **Create a project** from Dashboard
4. **Add team members** by their email
5. **Create tasks** and assign to members
6. **Drag & drop** tasks between columns
7. **Click any task** to add comments
8. **Get real-time notifications** 🔔 when tasks are updated

---

## 📸 Pages

| Page | Description |
|---|---|
| Login | User authentication |
| Register | Create new account |
| Dashboard | View all projects |
| Board | Kanban board with tasks |

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/finduser` | Find user by email |

### Projects
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | Get all projects |
| PUT | `/api/projects/:id/addmember` | Add member |

### Tasks
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:projectId` | Get tasks |
| PUT | `/api/tasks/:id` | Update task status |
| POST | `/api/tasks/:id/comment` | Add comment |

---

## 👨‍💻 Developer

**Your Name**
- GitHub: https://github.com/raghuram-007
- LinkedIn: https://www.linkedin.com/in/raghuram-webdev/

---

## 🏢 Internship

This project was built as **Task 3** of the **CodeAlpha Full Stack Development Internship**.

[![CodeAlpha](https://img.shields.io/badge/Internship-CodeAlpha-blue?style=for-the-badge)](https://www.codealpha.tech)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

⭐ **If you found this project helpful, please give it a star!** ⭐

