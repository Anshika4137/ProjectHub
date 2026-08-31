# ProjectHub

ProjectHub is a full-stack project-management application for small teams. Users can register, create and manage projects, invite existing users by email, organize tasks on a Kanban board, assign tasks, set priority/due dates, and comment on tasks.

The repository is a learning/portfolio implementation and is **not deployment-ready as-is**. Its verified limitations and improvement path are documented in [the readiness guide](docs/PROJECT_WORKFLOW_AND_READINESS.md).

## What is implemented

- JWT-based registration and login, with the token currently stored in browser local storage.
- Project create, list, edit, delete, add-member, and remove-member flows.
- Task create, edit, delete, reassignment, priority, due date, and Todo/In Progress/Done status.
- Drag-and-drop Kanban status changes.
- Create, edit, and delete task comments.
- Socket.io room events and session-only browser notifications.

## Architecture

```
React + Vite client (port 5173)
  ├─ Axios REST requests ──────────► Express API (port 5000) ─► MongoDB
  └─ Socket.io client ─────────────► Socket.io server
```

| Directory | Responsibility | Entry point |
| --- | --- | --- |
| `client/` | React 19 single-page app styled with Tailwind | `src/main.jsx` |
| `server/` | Express 5 API, Socket.io server, Mongoose models | `server.js` |

See [docs/PROJECT_AUDIT.md](docs/PROJECT_AUDIT.md) for the full source/dependency inventory, endpoint map, data model, verification results, and future decision record. See [docs/PROJECT_WORKFLOW_AND_READINESS.md](docs/PROJECT_WORKFLOW_AND_READINESS.md) for a plain-English explanation of how the product works.

## Technology

- Frontend: React 19, React Router 7, Vite 8, Tailwind CSS 4, Axios, Socket.io Client, Framer Motion, and `@hello-pangea/dnd`.
- Backend: Node.js, Express 5, MongoDB/Mongoose, JWT, bcryptjs, Socket.io, CORS, dotenv, and Nodemon.

## Run locally

Prerequisites: a current Node.js LTS release, npm, and a reachable MongoDB deployment. Node `v22.19.0` and npm `10.9.3` were present during the audit; the project currently declares no Node `engines` requirement.

1. Create a local server configuration. Never commit real secrets:

   ```env
   MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
   JWT_SECRET=use-a-long-random-value
   PORT=5000
   ```

2. Start the server in one terminal:

   ```bash
   cd server
   npm install
   npm run dev
   ```

3. Start the client in a second terminal:

   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open Vite's URL, normally `http://localhost:5173`, register, then create a project.

The client currently hard-codes `http://localhost:5000` for REST and WebSockets. Replace this with environment-driven configuration before deployment.

## API overview

Except for registration/login, endpoints expect `Authorization: Bearer <token>`.

| Area | Routes |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/finduser?email=` |
| Projects | `POST/GET /api/projects`, `PUT/DELETE /api/projects/:id`, `PUT /:id/addmember`, `PUT /:id/removemember` |
| Tasks | `POST /api/tasks`, `GET /api/tasks/:projectId`, `PUT/DELETE /api/tasks/:id` |
| Comments | `POST /api/tasks/:id/comment`, `PUT/DELETE /api/tasks/:id/comment/:commentId` |

## Scripts

| Package | Command | Purpose |
| --- | --- | --- |
| `server` | `npm start` | Run API server |
| `server` | `npm run dev` | Run API with Nodemon |
| `client` | `npm run dev` | Run Vite server |
| `client` | `npm run lint` | Run ESLint |
| `client` | `npm run build` | Create production bundle |
| `client` | `npm run preview` | Preview completed build |

## Verification snapshot — 30 August 2026

- Offline `npm audit --omit=dev` reported 0 known vulnerabilities for both dependency trees; this is not a full online security audit.
- `npm run lint` currently fails with four errors and two warnings.
- `npm run build` currently fails in the audit environment when Tailwind's native Windows binary loads, followed by Vite `spawn EPERM`.
- No automated tests or CI workflow are present.

## Repository hygiene and security

`server/.env` is currently tracked by Git and dependency folders are tracked too. Rotate any potentially exposed MongoDB/JWT values, remove the secret and generated dependency files in a deliberate cleanup change, add a root `.gitignore`, and commit a safe `server/.env.example`. The full prioritized remediation plan is in the readiness guide.

## License

The former README declared MIT, but no tracked `LICENSE` file exists. Add the intended license before publishing.
