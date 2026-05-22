# ERP SaaS Deployment Guide

## Backend

1. Create a managed PostgreSQL database.
2. Run `database/schema.sql` against the production database.
3. Deploy the `backend` folder to a Node.js host.
4. Add production environment variables from `backend/.env.example`.
5. Set `NODE_ENV=production`.
6. Set `CORS_ORIGIN` to the deployed frontend URL.
7. Use a long random `JWT_SECRET`.
8. Start with `npm start`.

## Frontend

1. Deploy the `frontend` folder to a static host.
2. Set `VITE_API_URL` to the deployed backend URL.
3. Run `npm run build`.
4. Serve the generated `dist` folder.

## Production Checklist

- Use HTTPS for frontend and backend.
- Use a managed PostgreSQL database with backups enabled.
- Keep `.env` files out of Git.
- Rotate database passwords and JWT secrets before public launch.
- Restrict database access to the backend host where possible.
- Configure backend logs and uptime monitoring.
- Run `npm audit` before deployment.
- Test register, login, product creation, customer creation, and order creation after deployment.
- Enable GitHub Actions CI with `.github/workflows/ci.yml`.
- Run database migrations in order before pointing production traffic at a new release.
- Configure SMTP variables for email notifications. See `docs/EMAIL_SETUP.md`.
