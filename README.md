# ERP SaaS

Production-ready multi-tenant ERP SaaS starter built with React, Express, Node.js, and PostgreSQL.

## Modules

- Company registration and staff login
- Customer portal registration and login
- Inventory management
- Customers
- Sales orders
- Customer ordering
- Billing, invoices, and payments
- Printable invoices
- Suppliers and purchase orders
- Staff roles and permissions
- Audit logs
- Email notifications
- Seed data
- Deployment docs and CI workflow

## Local Development

Backend:

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Database:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d erp_saas -f database/schema.sql
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -h localhost -p 5432 -U postgres -d erp_saas -f database/seed.sql
```

## Demo Accounts

Staff:

```text
admin@acmeerp.com / password123
manager@acmeerp.com / password123
sales@acmeerp.com / password123
inventory@acmeerp.com / password123
accounts@acmeerp.com / password123
```

Customer:

```text
Company email: demo@acmeerp.com
Customer email: jane.customer@example.com
Password: password123
```

## Deployment

See:

```text
docs/DEPLOYMENT.md
docs/EMAIL_SETUP.md
```
