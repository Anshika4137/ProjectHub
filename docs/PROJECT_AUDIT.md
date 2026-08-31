# ProjectHub — Technical Audit and Decision Record

**Audit date:** 30 August 2026  
**Scope:** Tracked application source, manifests/lockfiles, installed top-level packages, configuration, repository hygiene, and local quality checks. Dependency folders were inventoried as generated content rather than application source.

## Executive assessment

ProjectHub is a coherent MERN portfolio prototype: it demonstrates authentication, project ownership, task planning, comments, task metadata, responsive UI, and Socket.io concepts. It is a workable base for a recruiter demo after a focused hardening pass.

It must not be deployed publicly in its present state. Critical issues are a tracked `.env`, object-level authorization gaps, unauthenticated WebSockets, universal CORS, localhost-only client URLs, tracked dependencies, and failed quality gates.

## Repository inventory

| Area | Contents / finding |
| --- | --- |
| Root | `README.md`; no root manifest, no root `.gitignore`, no tracked `LICENSE`, no CI configuration |
| Client | Vite/React package, pages, shared components, auth context, image/SVG assets, ESLint/Vite config |
| Server | Express app, auth middleware, User/Project/Task Mongoose models, auth/projects/tasks route modules |
| Lockfiles | Separate client and server `package-lock.json` files |
| Generated content | `client/node_modules` and `server/node_modules` are present; about 2,289 node_modules files are tracked |
| Configuration | `server/.env` exists **and is tracked**; `server/.env.example` is absent |
| Tests | No test or spec files found |
| Repository state | Working tree clean during audit; Node `v22.19.0`, npm `10.9.3` |

## Architecture

```
Browser → React 19 / Vite / Tailwind
        ├─ Axios HTTP → Express 5 REST API → Mongoose → MongoDB
        └─ Socket.io → HTTP/Socket.io server → per-project room broadcasts
```

### Client

| File/area | Responsibility |
| --- | --- |
| `src/main.jsx` | React Strict Mode mount |
| `src/App.jsx` | Auth provider, browser router, private route guard, footer |
| `context/AuthContext.jsx` | User/token React state and local-storage persistence |
| `pages/Login.jsx`, `Register.jsx` | Submit credentials and navigate after successful auth |
| `pages/Dashboard.jsx` | List/create/edit/delete projects; owner controls; member removal |
| `pages/Board.jsx` | Current project/tasks, task mutation, Kanban DnD, adding members, Socket.io events |
| `components/CommentSection.jsx` | Comment CRUD UI |
| `components/Navbar.jsx` | Navigation, logged-in state, Socket.io notification list |
| `components/Footer.jsx` | Static footer |

Client routes are `/login`, `/register`, `/dashboard`, and `/board/:projectId`; all other paths redirect to login. The private route checks only that a local token exists; server checks decide actual access.

The client creates Socket.io connections in both the navbar and board. Notifications live only in memory and are cleared on refresh/logout. All REST and WebSocket URLs are hard-coded to `http://localhost:5000`.

### Server

`server.js` loads environment values, creates Express/HTTP/Socket.io, enables CORS/JSON parsing, mounts routes, connects MongoDB with `MONGO_URI`, and listens on `PORT || 5000`.

| Collection | Fields |
| --- | --- |
| User | required name, unique required email, bcrypt password, timestamps |
| Project | required name, optional description, owner User ref, member User refs, timestamps |
| Task | required title; optional description/project/assignee refs; status enum Todo/In Progress/Done; priority enum Low/Medium/High; nullable due date; embedded comments; timestamps |
| Comment | user ref, text, createdAt |

Auth expects `Authorization: Bearer <JWT>`. Register/login issue a JWT containing the user id and expiring after seven days. Passwords are hashed with bcrypt salt rounds 10. Input length, format (aside from database uniqueness), ObjectId, and project/assignee relationship validation are not implemented.

## Dependencies

| Package | Declared version | Purpose |
| --- | --- | --- |
| `react`, `react-dom` | `^19.2.4` | client UI |
| `react-router-dom` | `^7.13.1` | routes/navigation |
| `vite` | `^8.0.1` | client dev/build |
| `tailwindcss`, `@tailwindcss/vite` | `^4.2.2` | utility styling |
| `axios` | `^1.13.6` | REST client |
| `socket.io-client`, `socket.io` | `^4.8.3` | real-time transport |
| `@hello-pangea/dnd` | `^18.0.1` | Kanban drag-and-drop |
| `framer-motion` | `^12.38.0` | declared; no source import found |
| `express` | `^5.2.1` | REST server |
| `mongoose` | `^9.3.1` | MongoDB model/query layer |
| `jsonwebtoken` | `^9.0.3` | JWTs |
| `bcryptjs` | `^3.0.3` | password hashing |
| `cors`, `dotenv` | `^2.8.6`, `^17.3.1` | CORS/env configuration |
| `nodemon` | `^3.1.14` | development restart |

## REST and real-time surface

| Route | Current behavior |
| --- | --- |
| `POST /api/auth/register` | Creates user, returns token and user data |
| `POST /api/auth/login` | Validates password, returns token and user data |
| `GET /api/auth/finduser?email=` | Authenticated lookup of a user, password excluded |
| `POST`, `GET /api/projects` | Create owned project; list current user's member projects |
| `PUT`, `DELETE /api/projects/:id` | Owner-only edit/delete |
| `PUT /api/projects/:id/addmember`, `/removemember` | Owner-only member management; owner cannot be removed |
| `POST /api/tasks` | Intended owner-only creation |
| `GET /api/tasks/:projectId` | Authenticated task list; no membership check |
| `PUT /api/tasks/:id` | Authenticated update; no owner/member check |
| `DELETE /api/tasks/:id` | Owner-only delete |
| comment POST/PUT/DELETE | Create needs only auth; edit/delete check comment author |

Socket clients can emit `joinProject`, `taskUpdated`, `newTask`, and `taskAssigned`. The server joins the named room then broadcasts `refreshTasks` or `notification` to the room. The socket handshake, room join, and event payloads have no authentication, authorization, or validation; `assignedTo` is not used for per-user targeting. Both Express and Socket.io accept every origin.

## Verified quality checks

| Check | Result |
| --- | --- |
| `npm ls --depth=0` in server | passed; all declared server packages resolved |
| Offline production dependency audit, server/client | 0 known vulnerabilities in local advisory data |
| Client lint | failed: 4 errors and 2 warnings |
| Client build | failed: Tailwind Windows native binding load failure followed by Vite `spawn EPERM` |
| Tests/CI | absent |

Lint failures include an AuthContext Fast Refresh export rule, missing hook dependencies, a set-state-in-effect rule, and unused error bindings. The offline audit is not a complete or current security assessment.

## Prioritized findings

### Critical

1. **Secret exposure risk:** Treat values in tracked `server/.env` as exposed. Rotate them, remove tracking/history through an approved cleanup, ignore secrets, and commit a safe example file.
2. **Broken authorization:** An authenticated outsider who has identifiers can read/update tasks or create comments in projects they do not belong to. Centralize owner/member checks and apply them to every endpoint.
3. **Unauthenticated real-time layer:** Configure origins; authenticate socket handshakes; authorize project room joins; have server code emit events after validated mutations rather than trusting browser events.
4. **No deployment configuration:** Replace fixed URLs with Vite runtime/build environment variables and server allowed-origin configuration.

### High

5. Add request schemas, ObjectId validation, trimming/length limits, password rules, safe 400/404 errors, and assignee-membership verification.
6. Prevent orphaned tasks after project deletion; define task behavior when a member is removed; handle missing Project/Task documents before dereferencing them.
7. Add API authorization integration tests, an end-to-end flow, CI, `/health`, centralized error middleware, and production logging.
8. Address token storage/XSS trade-offs, rate limit auth, add security headers, and provide password recovery/verification if the product is public.

### Medium

9. Remove tracked `node_modules`, add root ignore rules and `engines`, keep lockfiles, and consider npm workspaces/concurrent scripts.
10. Fix lint/build from a clean installation; remove unused assets/dependencies or use them.
11. Consolidate socket lifecycle in a provider, persist/label notifications, add accessible dialogs/focus states, destructive confirmations, loading/error states, screenshots, metadata, live demo, and license.

## Decisions required before upgrades

- Target hosting providers and whether Docker is desired.
- Whether existing MongoDB data must survive upgrades/migrations.
- Desired roles: only owner/member, or admin/editor/viewer.
- Invite-email versus already-registered-user addition.
- Permission to rotate secrets and remove the currently tracked `.env` from Git.
