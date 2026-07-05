# Task Management System — Backend

Node.js + Express + TypeScript + MySQL (Sequelize)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a MySQL database:
   ```sql
   CREATE DATABASE task_management;
   ```

3. Copy `.env.example` to `.env` and fill in your MySQL credentials and a JWT secret:
   ```bash
   cp .env.example .env
   ```

4. (Optional) Seed a default admin account:
   ```bash
   npm run seed
   ```
   Creates `admin@taskmanager.com` / `Admin@123`.

5. Start the dev server (tables are auto-created/synced on boot):
   ```bash
   npm run dev
   ```

   Server runs at `http://localhost:5000`.

## Build for production

```bash
npm run build
npm start
```

## API overview

| Method | Endpoint                        | Access        |
|--------|----------------------------------|---------------|
| POST   | /api/register                    | Public        |
| POST   | /api/login                       | Public        |
| POST   | /api/logout                      | Public        |
| GET    | /api/dashboard                   | Authenticated |
| GET    | /api/employees                   | Admin         |
| POST   | /api/employees                   | Admin         |
| PUT    | /api/employees/:id                | Admin         |
| DELETE | /api/employees/:id                | Admin         |
| GET    | /api/tasks                       | Authenticated |
| POST   | /api/tasks (multipart, field `file`) | Admin     |
| PUT    | /api/tasks/:id (multipart, field `file`) | Owner/Admin |
| DELETE | /api/tasks/:id                    | Admin         |
| GET    | /api/reports?type=completed\|pending\|employee-wise | Admin |
| GET    | /api/reports/export/csv?type=...  | Admin         |
| GET    | /api/reports/export/excel?type=...| Admin         |
| GET    | /api/notifications                | Authenticated |
| PUT    | /api/notifications/:id/read       | Authenticated |

## Notes

- Employees are created automatically with a matching row in `employees` whenever
  someone registers with role `Employee`, so they immediately appear in Admin's
  employee list. Admins can also create employees directly (optionally with a login).
- File uploads (PDF/JPG/PNG, max 5 MB) are stored in `/uploads` and served statically
  at `http://localhost:5000/uploads/<filename>`.
- "Due within 1 day" notifications are computed on read rather than via a cron job,
  to keep the assignment self-contained; wire up `node-cron` + nodemailer for real
  email notifications as a bonus enhancement.
