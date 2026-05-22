CREATE TABLE IF NOT EXISTS sales_leads (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  team_size VARCHAR(50),
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_leads_email ON sales_leads(email);
CREATE INDEX IF NOT EXISTS idx_sales_leads_created_at ON sales_leads(created_at);
