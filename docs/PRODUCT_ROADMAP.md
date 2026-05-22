# ERP SaaS Product Roadmap

## Added In This Build

- Company/staff ERP dashboard.
- Customer portal registration and login.
- Customer product browsing and order placement.
- Inventory create, edit, and delete.
- Customer create, edit, and delete.
- Sales order creation and status updates.
- Multi-tenant database scoping by company.
- JWT authentication for staff and customer accounts.
- Production hardening baseline: CORS, rate limiting, security headers, error middleware, env templates, and deployment guide.

## Recommended Next Additions

### 1. Staff Roles And Permissions

- Admin, Manager, Sales, Inventory Clerk, Accountant.
- Restrict destructive actions like delete products and cancel orders.
- Add role management screens.

### 2. Invoices And Receipts

- Generate invoice numbers.
- Create printable invoice pages.
- Export invoice PDF.
- Mark invoices as paid, partially paid, overdue, or void.

### 3. Payments

- Track payment method, amount, reference number, and date.
- Support partial payments.
- Add outstanding balance reports.
- Later integrate M-Pesa, Stripe, or PayPal depending on target market.

### 4. Purchase And Supplier Module

- Suppliers CRUD.
- Purchase orders.
- Stock receiving.
- Cost tracking.

### 5. Audit Logs

- Record who created, edited, deleted, or updated records.
- Track old value and new value for sensitive changes.

### 6. Notifications

- Low stock alerts.
- New customer order notifications.
- Order status update emails to customers.

### 7. Reporting

- Date range filters.
- Sales by product.
- Sales by customer.
- Inventory valuation.
- Low stock export.
- CSV/PDF exports.

### 8. Production Deployment

- GitHub repository.
- CI/CD checks for backend syntax, frontend lint, frontend build, and dependency audit.
- Managed PostgreSQL database.
- SSL-enabled backend.
- Static frontend hosting.
- Monitoring and error logging.

## Highest Impact Next Phase

Build invoices and payment tracking next. This turns the app from order management into a proper ERP sales workflow.
