# Git, GitHub, And Deployment

## 1. Install Git

Download and install Git for Windows:

```text
https://git-scm.com/download/win
```

During setup, choose:

```text
Git from the command line and also from 3rd-party software
```

Close and reopen PowerShell, then verify:

```powershell
git --version
```

Expected:

```text
git version 2.x.x.windows.x
```

## 2. Initialize Repository

From the project root:

```powershell
cd "C:\Users\Evans Murimi\Documents\Codex\2026-05-21\you-are-a-senior-full-stack\erp-saas"
git init
git add .
git commit -m "Initial ERP SaaS production baseline"
```

## 3. Push To GitHub

Create a new empty repository on GitHub, then run:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/erp-saas.git
git push -u origin main
```

## 4. Deploy Backend On Render

1. Create a PostgreSQL database on Render, Railway, Neon, Supabase, or another provider.
2. Create a Render Web Service from your GitHub repo.
3. Set root directory:

```text
backend
```

4. Build command:

```text
npm ci
```

5. Start command:

```text
npm start
```

6. Add backend environment variables from:

```text
backend/.env.example
```

7. Set `CORS_ORIGIN` to your frontend production URL.

## 5. Deploy Frontend On Vercel

1. Import the same GitHub repo into Vercel.
2. Set root directory:

```text
frontend
```

3. Build command:

```text
npm run build
```

4. Output directory:

```text
dist
```

5. Add environment variable:

```text
VITE_API_URL=https://your-backend-url.onrender.com
```

## 6. Run Production Migrations

Run migrations against your production PostgreSQL database in order:

```text
database/schema.sql
database/migrations/002_customer_portal.sql
database/migrations/003_invoices_payments.sql
database/migrations/004_staff_roles.sql
database/migrations/005_suppliers_purchases.sql
database/migrations/006_audit_logs.sql
```

For a fresh database, `schema.sql` already contains the complete latest schema.

## 7. Final Production Test

Test:

- Company registration
- Staff login
- Inventory create/edit/delete
- Customer portal registration
- Customer order placement
- Sales order visibility
- Invoice creation
- Payment recording
- Purchase order receiving
- Audit log visibility
