BEGIN;

WITH company_insert AS (
  INSERT INTO companies (name, email, phone, address)
  VALUES ('Acme Distribution Ltd', 'demo@acmeerp.com', '0712000000', 'Nairobi Industrial Area')
  ON CONFLICT (email) DO UPDATE
  SET name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address,
      updated_at = CURRENT_TIMESTAMP
  RETURNING id
),
company_ref AS (
  SELECT id FROM company_insert
  UNION
  SELECT id FROM companies WHERE email = 'demo@acmeerp.com'
  LIMIT 1
),
role_insert AS (
  INSERT INTO roles (company_id, name, description)
  SELECT id, 'Admin', 'Company administrator'
  FROM company_ref
  ON CONFLICT (company_id, name) DO UPDATE
  SET description = EXCLUDED.description,
      updated_at = CURRENT_TIMESTAMP
  RETURNING id, company_id
)
INSERT INTO users (company_id, role_id, name, email, password_hash)
SELECT
  company_ref.id,
  role_insert.id,
  'Demo Admin',
  'admin@acmeerp.com',
  '$2b$10$LtbqbCAoaLgSX4ZCd5jYPOoee/L1pqCWj7bUGAdejCs3mE4jqQgpq'
FROM company_ref
JOIN role_insert ON role_insert.company_id = company_ref.id
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role_id = EXCLUDED.role_id,
    company_id = EXCLUDED.company_id,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

WITH company_ref AS (
  SELECT id FROM companies WHERE email = 'demo@acmeerp.com'
),
staff_seed AS (
  SELECT *
  FROM (
    VALUES
      ('Sales User', 'sales@acmeerp.com', 'Sales'),
      ('Inventory User', 'inventory@acmeerp.com', 'Inventory Clerk'),
      ('Accounts User', 'accounts@acmeerp.com', 'Accountant'),
      ('Manager User', 'manager@acmeerp.com', 'Manager')
  ) AS seed(name, email, role_name)
)
INSERT INTO users (company_id, role_id, name, email, password_hash)
SELECT
  company_ref.id,
  roles.id,
  staff_seed.name,
  staff_seed.email,
  '$2b$10$LtbqbCAoaLgSX4ZCd5jYPOoee/L1pqCWj7bUGAdejCs3mE4jqQgpq'
FROM company_ref
JOIN staff_seed ON TRUE
JOIN roles ON roles.company_id = company_ref.id AND roles.name = staff_seed.role_name
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    role_id = EXCLUDED.role_id,
    company_id = EXCLUDED.company_id,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

WITH company_ref AS (
  SELECT id FROM companies WHERE email = 'demo@acmeerp.com'
)
INSERT INTO products (company_id, name, sku, description, price, stock_quantity, reorder_level)
SELECT company_ref.id, seed.name, seed.sku, seed.description, seed.price, seed.stock_quantity, seed.reorder_level
FROM company_ref
CROSS JOIN (
  VALUES
    ('Business Laptop', 'LAP-001', 'Durable laptop for office teams', 75000.00, 15, 3),
    ('Wireless Mouse', 'ACC-101', 'Ergonomic wireless mouse', 1800.00, 80, 15),
    ('Office Desk', 'FUR-210', 'Modern workstation desk', 22000.00, 8, 2),
    ('Thermal Printer', 'POS-330', 'Receipt printer for sales counters', 14500.00, 5, 2),
    ('Barcode Scanner', 'POS-120', 'USB barcode scanner', 8500.00, 12, 4),
    ('A4 Copy Paper', 'STA-010', 'Carton of A4 office paper', 3200.00, 40, 10)
) AS seed(name, sku, description, price, stock_quantity, reorder_level)
ON CONFLICT (company_id, sku) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    stock_quantity = EXCLUDED.stock_quantity,
    reorder_level = EXCLUDED.reorder_level,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

WITH company_ref AS (
  SELECT id FROM companies WHERE email = 'demo@acmeerp.com'
)
INSERT INTO customers (company_id, name, email, phone, address)
SELECT company_ref.id, seed.name, seed.email, seed.phone, seed.address
FROM company_ref
CROSS JOIN (
  VALUES
    ('Jane Customer', 'jane.customer@example.com', '0712111000', 'Westlands, Nairobi'),
    ('Bright Retail Shop', 'orders@brightretail.com', '0712222000', 'Moi Avenue, Nairobi'),
    ('Mombasa Office Supplies', 'procurement@mombasaoffice.com', '0712333000', 'Nyali, Mombasa')
) AS seed(name, email, phone, address)
ON CONFLICT (company_id, email) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    updated_at = CURRENT_TIMESTAMP;

WITH company_ref AS (
  SELECT id FROM companies WHERE email = 'demo@acmeerp.com'
),
customer_ref AS (
  SELECT customers.id, customers.company_id, customers.name, customers.email
  FROM customers
  JOIN company_ref ON company_ref.id = customers.company_id
  WHERE customers.email = 'jane.customer@example.com'
)
INSERT INTO customer_accounts (company_id, customer_id, name, email, password_hash)
SELECT
  customer_ref.company_id,
  customer_ref.id,
  customer_ref.name,
  customer_ref.email,
  '$2b$10$LtbqbCAoaLgSX4ZCd5jYPOoee/L1pqCWj7bUGAdejCs3mE4jqQgpq'
FROM customer_ref
ON CONFLICT (company_id, email) DO UPDATE
SET name = EXCLUDED.name,
    password_hash = EXCLUDED.password_hash,
    is_active = TRUE,
    updated_at = CURRENT_TIMESTAMP;

WITH company_ref AS (
  SELECT id FROM companies WHERE email = 'demo@acmeerp.com'
),
customer_ref AS (
  SELECT customers.id AS customer_id, customers.company_id
  FROM customers
  JOIN company_ref ON company_ref.id = customers.company_id
  WHERE customers.email = 'orders@brightretail.com'
),
order_insert AS (
  INSERT INTO orders (company_id, customer_id, order_number, status, total_amount)
  SELECT customer_ref.company_id, customer_ref.customer_id, 'DEMO-ORDER-001', 'paid', 0
  FROM customer_ref
  ON CONFLICT (company_id, order_number) DO UPDATE
  SET status = EXCLUDED.status,
      updated_at = CURRENT_TIMESTAMP
  RETURNING id, company_id
),
items_seed AS (
  SELECT order_insert.id AS order_id, products.company_id, products.id AS product_id, seed.quantity, products.price AS unit_price
  FROM order_insert
  JOIN products ON products.company_id = order_insert.company_id
  JOIN (
    VALUES
      ('LAP-001', 2),
      ('ACC-101', 5),
      ('STA-010', 3)
  ) AS seed(sku, quantity) ON seed.sku = products.sku
),
items_deleted AS (
  DELETE FROM order_items
  WHERE order_id IN (SELECT id FROM order_insert)
)
INSERT INTO order_items (company_id, order_id, product_id, quantity, unit_price, line_total)
SELECT company_id, order_id, product_id, quantity, unit_price, quantity * unit_price
FROM items_seed;

WITH order_totals AS (
  SELECT order_id, SUM(line_total) AS total_amount
  FROM order_items
  GROUP BY order_id
)
UPDATE orders
SET total_amount = order_totals.total_amount,
    updated_at = CURRENT_TIMESTAMP
FROM order_totals
WHERE orders.id = order_totals.order_id;

WITH order_ref AS (
  SELECT orders.id, orders.company_id, orders.customer_id, orders.total_amount
  FROM orders
  JOIN companies ON companies.id = orders.company_id
  WHERE companies.email = 'demo@acmeerp.com' AND orders.order_number = 'DEMO-ORDER-001'
),
invoice_insert AS (
  INSERT INTO invoices (company_id, order_id, customer_id, invoice_number, status, total_amount, paid_amount, balance_due, due_date)
  SELECT company_id, id, customer_id, 'DEMO-INV-001', 'partial', total_amount, 50000.00, total_amount - 50000.00, CURRENT_DATE + INTERVAL '14 days'
  FROM order_ref
  ON CONFLICT (company_id, order_id) DO UPDATE
  SET status = EXCLUDED.status,
      total_amount = EXCLUDED.total_amount,
      paid_amount = EXCLUDED.paid_amount,
      balance_due = EXCLUDED.balance_due,
      due_date = EXCLUDED.due_date,
      updated_at = CURRENT_TIMESTAMP
  RETURNING id, company_id, customer_id
)
INSERT INTO payments (company_id, invoice_id, customer_id, amount, method, reference)
SELECT company_id, id, customer_id, 50000.00, 'mpesa', 'DEMO-MPESA-001'
FROM invoice_insert
WHERE NOT EXISTS (
  SELECT 1 FROM payments WHERE payments.invoice_id = invoice_insert.id AND payments.reference = 'DEMO-MPESA-001'
);

WITH company_ref AS (
  SELECT id FROM companies WHERE email = 'demo@acmeerp.com'
)
INSERT INTO suppliers (company_id, name, email, phone, address)
SELECT company_ref.id, seed.name, seed.email, seed.phone, seed.address
FROM company_ref
CROSS JOIN (
  VALUES
    ('TechSource Wholesale', 'sales@techsource.example.com', '0712444000', 'Mombasa Road, Nairobi'),
    ('OfficeMart Supplies', 'orders@officemart.example.com', '0712555000', 'Industrial Area, Nairobi')
) AS seed(name, email, phone, address)
ON CONFLICT (company_id, email) DO UPDATE
SET name = EXCLUDED.name,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    updated_at = CURRENT_TIMESTAMP;

WITH company_ref AS (
  SELECT id FROM companies WHERE email = 'demo@acmeerp.com'
),
supplier_ref AS (
  SELECT suppliers.id, suppliers.company_id
  FROM suppliers
  JOIN company_ref ON company_ref.id = suppliers.company_id
  WHERE suppliers.email = 'sales@techsource.example.com'
),
po_insert AS (
  INSERT INTO purchase_orders (company_id, supplier_id, purchase_order_number, status, total_amount)
  SELECT supplier_ref.company_id, supplier_ref.id, 'DEMO-PO-001', 'ordered', 0
  FROM supplier_ref
  ON CONFLICT (company_id, purchase_order_number) DO UPDATE
  SET status = EXCLUDED.status,
      updated_at = CURRENT_TIMESTAMP
  RETURNING id, company_id
),
items_seed AS (
  SELECT po_insert.id AS purchase_order_id, products.company_id, products.id AS product_id, seed.quantity, seed.unit_cost
  FROM po_insert
  JOIN products ON products.company_id = po_insert.company_id
  JOIN (
    VALUES
      ('LAP-001', 4, 61000.00),
      ('POS-120', 8, 6500.00)
  ) AS seed(sku, quantity, unit_cost) ON seed.sku = products.sku
),
items_deleted AS (
  DELETE FROM purchase_order_items
  WHERE purchase_order_id IN (SELECT id FROM po_insert)
)
INSERT INTO purchase_order_items (company_id, purchase_order_id, product_id, quantity, unit_cost, line_total)
SELECT company_id, purchase_order_id, product_id, quantity, unit_cost, quantity * unit_cost
FROM items_seed;

WITH purchase_totals AS (
  SELECT purchase_order_id, SUM(line_total) AS total_amount
  FROM purchase_order_items
  GROUP BY purchase_order_id
)
UPDATE purchase_orders
SET total_amount = purchase_totals.total_amount,
    updated_at = CURRENT_TIMESTAMP
FROM purchase_totals
WHERE purchase_orders.id = purchase_totals.purchase_order_id;

COMMIT;
