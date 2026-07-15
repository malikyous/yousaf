-- Create database
CREATE DATABASE IF NOT EXISTS invoice_db;
USE invoice_db;

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    customer_email VARCHAR(200),
    customer_address TEXT,
    invoice_date DATE NOT NULL,
    due_date DATE,
    subtotal DECIMAL(10, 2) NOT NULL,
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    tax_amount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    qr_code_path VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    description VARCHAR(500) NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX idx_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_customer_name ON invoices(customer_name);
