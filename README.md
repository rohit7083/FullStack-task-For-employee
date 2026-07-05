# Employee Task Management System

Full-stack assignment build:

- **Frontend:** React + TypeScript + Redux Toolkit + React Router + Tailwind CSS (Vite)
- **Backend:** Node.js + Express + TypeScript + Sequelize + MySQL
- **Auth:** JWT with a "Remember Me" long-lived token option
- **Extras included:** file upload (PDF/JPG/PNG, 5 MB limit), in-app notifications
  (task assigned / due within 1 day / completed), CSV + Excel report export

## Quick start

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill in your MySQL credentials + a JWT secret
```

Create the database in MySQL:

```sql
CREATE DATABASE task_management;
```

Then:

```bash
npm run seed   # optional: creates admin@taskmanager.com / Admin@123
npm run dev    # starts on http://localhost:5000, tables auto-sync on boot
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # defaults to http://localhost:5000/api, adjust if needed
npm run dev             # starts on http://localhost:5173
```

Open `http://localhost:5173`, register an Admin account (or use the seeded one),
then register/add Employee accounts to start assigning tasks.

## How the pieces fit together

- Registering as **Employee** automatically creates a matching row in the
  `employees` table, so they show up immediately in the Admin's Employee list.
- Admins can also add employees directly, optionally creating a login for them
  in the same step.
- Employees only ever see and edit their own tasks; Admins see and manage
  everything. This is enforced both in the API (`authenticate` + role checks)
  and reflected in the UI (nav items, forms).
- Completed tasks are locked from editing on both the client and server.
- Task attachments are stored on disk under `backend/uploads` and served at
  `http://localhost:5000/uploads/<filename>`.
- Reports (`Pending`, `Completed`, `Employee-wise`) can be viewed in-app or
  exported as `.csv` / `.xlsx`.

## What's implemented vs. bonus

**Implemented:** registration/login/JWT/Remember Me/logout, role-based
dashboard, employee CRUD with search/sort/pagination, task CRUD with all
business rules, file upload, in-app notifications, report generation +
CSV/Excel export, responsive Tailwind UI with form validation.

**Not implemented (left as extensions):** Docker setup, automated unit tests,
and real email delivery (notifications currently live in-app only — wiring in
`nodemailer` + a scheduled job like `node-cron` for the "due within 1 day"
check would be the natural next step).
