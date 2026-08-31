# Understanding ProjectHub: Workflow and Readiness Plan

This guide explains the current application from a user's click to the database, then gives a prioritized path to a deployable recruiter project.

## How the application starts

1. `server/server.js` loads `MONGO_URI`, `JWT_SECRET`, and optional `PORT`, connects Mongoose to MongoDB, starts Express/Socket.io, and listens on port 5000 by default.
2. Vite serves the React client. `src/main.jsx` renders `App.jsx` in Strict Mode.
3. `App.jsx` provides auth state and routes. It protects the dashboard/board in the browser when no token is stored.
4. In the current development configuration the browser must reach Vite on port 5173 and API/WebSockets on port 5000.

## Register and sign in

1. The visitor uses `/register` to submit name, email, and password.
2. `Register.jsx` calls `POST /api/auth/register`.
3. The server rejects a duplicate email, hashes the password, saves a User, and returns a seven-day JWT plus safe user data.
4. `AuthContext` stores the user/token in React state and `localStorage`, then the app navigates to `/dashboard`.
5. Login uses the same final steps after the server compares the password with the bcrypt hash.

## Create a project and team

1. `Dashboard.jsx` calls authenticated `GET /api/projects`; the server returns projects whose `members` contains the current id.
2. **New Project** calls `POST /api/projects`. The creator becomes both owner and initial member.
3. Owners may edit/delete a project and remove non-owner members. The server checks ownership for these routes.
4. From the board, an owner can search an already-registered user by email and add that user to the project. This is not an email invitation system.

## Use the Kanban board

1. Selecting a project opens `/board/<projectId>`.
2. `Board.jsx` loads the project and `GET /api/tasks/:projectId`, then groups each task by `Todo`, `In Progress`, or `Done`.
3. The owner can create tasks with title, optional description, assignee, priority, and due date.
4. Editing/reassigning/deleting a task calls the task API. Dragging a card to a different column sends an update with the new status.
5. Due dates before the present time are shown as overdue. The present logic does not exclude completed tasks from that condition.

## Comments and real-time updates

1. Entering a comment sends `POST /api/tasks/:id/comment`; the server embeds it in the Task document with author/date.
2. On task reads, the server populates comment authors so the UI shows name and date. The comment's author can edit/delete it.
3. The board and navbar each connect to Socket.io. The board joins a project room and emits task events after task changes.
4. The server broadcasts task-refresh/notification events to the project room. Notifications are browser-memory only and disappear on refresh or logout.

The client behavior is clear, but Socket.io is not yet trusted-server safe: it accepts client-provided room/event data without JWT or membership checks.

## What is already valuable in a portfolio

You can credibly demonstrate full-stack JavaScript, data modeling, JWT authentication, route protection, owner-oriented flows, REST design, drag-and-drop interaction, responsive Tailwind styling, and a real-time collaboration concept. The project has a good feature story; the next work should prioritize reliability and security over adding more UI features.

## Recruiter-ready plan

### Phase A — secure and correct the product

1. Rotate the tracked MongoDB/JWT values, remove secret tracking, add a root `.gitignore`, and commit `server/.env.example`.
2. Validate every API request (input length/format, IDs, dates, statuses, password strength, users/assignees).
3. Add reusable project-member/project-owner authorization checks to every task, comment, and project route.
4. Restrict HTTP and WebSocket CORS to configured origins; authenticate the socket handshake and authorize rooms.
5. Replace `localhost` URLs with `VITE_API_URL` and `VITE_SOCKET_URL`; configure allowed client origins on the server.
6. Decide and implement project/task deletion and member-removal rules to prevent orphaned/inaccessible data.

### Phase B — make it verifiable and operable

1. Remove tracked dependency folders and use `npm ci` with lockfiles.
2. Fix the current lint errors/warnings and repair the Vite/Tailwind build from a clean install on the target OS.
3. Add backend authorization/validation integration tests and an end-to-end flow: register → create project → add member → create/move/comment task.
4. Add CI that installs, lints, tests, and builds every pull request.
5. Add `/health`, centralized error middleware, structured logs, rate limiting, security headers, and stable production error responses.

### Phase C — make it presentation-ready

1. Deploy the client, API/WebSockets, and MongoDB securely over HTTPS; add the live link in README.
2. Add a product title/meta/OG image, screenshots or short GIF, favicon, and a concise architecture/security story.
3. Consolidate Socket.io lifecycle in one provider and either persist notifications or label them session-only.
4. Add accessible keyboard/focus/modals, loading/error/toast states, confirm dialogs, mobile QA, and a small accessibility review.
5. Add a license and explain setup, testing, design choices, and trade-offs in the README.

## Optional improvements after the foundation

- Email invitations with expiring tokens.
- Admin/editor/viewer roles.
- Labels, search, filters, pagination, attachments, activity history, and mentions.
- Persistent/readable notifications and targeted assignee alerts.
- Password reset/email verification, profile settings, session management.
- Docker Compose and a safe seed/demo mode.

## Suggested recruiter demo

1. Register two demo accounts in separate profiles.
2. With Account A, create **Recruiter Demo** and explain ownership.
3. Add Account B, open the board, then create and assign a high-priority dated task.
4. Show Account B receive the update, move the task across columns, and comment.
5. Close with the live README, test badge/status, architecture, and the security/authorization decisions you implemented.

## Choices needed before implementation

Please decide the hosting target(s), whether Docker is wanted, whether existing MongoDB data must be preserved, the desired role/invitation model, and whether I may rotate/remove the tracked secret configuration. Those decisions change security, data migration, and deployment work, so no disruptive upgrade was made during this documentation pass.
