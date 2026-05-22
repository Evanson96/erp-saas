INSERT INTO roles (company_id, name, description)
SELECT companies.id, seed.name, seed.description
FROM companies
CROSS JOIN (
  VALUES
    ('Admin', 'Full access to all company modules'),
    ('Manager', 'Operational access to sales, inventory, customers, billing, and reports'),
    ('Sales', 'Access to customers and sales orders'),
    ('Inventory Clerk', 'Access to inventory management'),
    ('Accountant', 'Access to billing, payments, and reports')
) AS seed(name, description)
ON CONFLICT (company_id, name) DO UPDATE
SET description = EXCLUDED.description,
    updated_at = CURRENT_TIMESTAMP;
