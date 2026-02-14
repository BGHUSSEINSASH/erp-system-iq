ERP Web Starter (React + Express + SQL Server)

Overview
- Monorepo with a React web app and an Express API.
- RBAC starter endpoints for users and roles.
- SQL Server connection placeholder for future persistence.

Setup
1) Install dependencies at repo root.
2) Create apps/api/.env using apps/api/.env.example.
3) Run the API and web app in separate terminals.

Commands
- API dev: npm -w apps/api run dev
- Web dev: npm -w apps/web run dev
- API build: npm -w apps/api run build
- Web build: npm -w apps/web run build

Notes
- The login endpoint returns a JWT for local development only.
- Replace the mock users with SQL Server queries when ready.
