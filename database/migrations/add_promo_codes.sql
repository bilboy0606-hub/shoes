-- Migration: Add promo codes system
-- Date: 2026-02-07

-- Create promo_codes table
CREATE TABLE IF NOT EXISTS promo_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('percentage', 'fixed') NOT NULL DEFAULT 'percentage',
    value DECIMAL(10, 2) NOT NULL,
    min_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    max_uses INT DEFAULT NULL,
    current_uses INT NOT NULL DEFAULT 0,
    expires_at TIMESTAMP NULL DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add promo code columns to orders table
ALTER TABLE orders
ADD COLUMN promo_code VARCHAR(50) NULL AFTER stripe_session_id,
ADD COLUMN discount_amount DECIMAL(10, 2) DEFAULT 0.00 AFTER promo_code,
ADD COLUMN original_total DECIMAL(10, 2) NULL AFTER discount_amount;

-- Insert sample promo codes for testing
INSERT INTO promo_codes (code, type, value, min_order_amount, max_uses, is_active) VALUES
('BIENVENUE10', 'percentage', 10.00, 50.00, 100, 1),
('KICK20', 'fixed', 20.00, 100.00, 50, 1),
('VIP15', 'percentage', 15.00, 0.00, NULL, 1);
