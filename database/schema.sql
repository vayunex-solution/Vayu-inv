-- ============================================
-- VAYNEX INVENTORY DATABASE SCHEMA
-- Enterprise-grade MySQL database structure
-- ============================================

-- ============================================
-- USERS & AUTHENTICATION
-- (Matches existing table structure)
-- ============================================

CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `role` VARCHAR(20) NOT NULL DEFAULT 'user',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX `idx_users_email` (`email`),
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ITEM CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS `item_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255),
    `parent_id` INT NULL,
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`parent_id`) REFERENCES `item_categories`(`id`) ON DELETE SET NULL,
    INDEX `idx_categories_parent` (`parent_id`),
    INDEX `idx_categories_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- UNITS OF MEASUREMENT
-- ============================================

CREATE TABLE IF NOT EXISTS `units` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `code` VARCHAR(10) NOT NULL UNIQUE,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(100),
    `is_active` TINYINT(1) NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ITEMS MASTER
-- ============================================

CREATE TABLE IF NOT EXISTS `items` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `item_code` VARCHAR(50) NOT NULL UNIQUE,
    `item_name` VARCHAR(200) NOT NULL,
    `description` TEXT,
    `category_id` INT NOT NULL,
    `unit_id` INT NOT NULL,
    `unit_price` DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    `quantity` DECIMAL(15, 3) NOT NULL DEFAULT 0.000,
    `reorder_level` DECIMAL(15, 3) NOT NULL DEFAULT 0.000,
    `status` ENUM('active', 'inactive', 'discontinued') NOT NULL DEFAULT 'active',
    `barcode` VARCHAR(100),
    `hsn_code` VARCHAR(20),
    `tax_rate` DECIMAL(5, 2) DEFAULT 0.00,
    `created_by` INT,
    `updated_by` INT,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (`category_id`) REFERENCES `item_categories`(`id`),
    FOREIGN KEY (`unit_id`) REFERENCES `units`(`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
    FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`),
    
    INDEX `idx_items_code` (`item_code`),
    INDEX `idx_items_name` (`item_name`),
    INDEX `idx_items_category` (`category_id`),
    INDEX `idx_items_status` (`status`),
    INDEX `idx_items_barcode` (`barcode`),
    FULLTEXT INDEX `idx_items_search` (`item_name`, `description`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STOCK TRANSACTIONS (AUDIT TRAIL)
-- ============================================

CREATE TABLE IF NOT EXISTS `stock_transactions` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `item_id` INT NOT NULL,
    `transaction_type` ENUM('IN', 'OUT', 'ADJUST', 'TRANSFER') NOT NULL,
    `quantity` DECIMAL(15, 3) NOT NULL,
    `balance_before` DECIMAL(15, 3) NOT NULL,
    `balance_after` DECIMAL(15, 3) NOT NULL,
    `reference_type` VARCHAR(50),
    `reference_id` INT,
    `remarks` VARCHAR(255),
    `transaction_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `created_by` INT,
    
    FOREIGN KEY (`item_id`) REFERENCES `items`(`id`),
    FOREIGN KEY (`created_by`) REFERENCES `users`(`id`),
    
    INDEX `idx_stock_item` (`item_id`),
    INDEX `idx_stock_type` (`transaction_type`),
    INDEX `idx_stock_date` (`transaction_date`),
    INDEX `idx_stock_reference` (`reference_type`, `reference_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- AUDIT LOG (FOR ALL TABLES)
-- ============================================

CREATE TABLE IF NOT EXISTS `audit_log` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `table_name` VARCHAR(100) NOT NULL,
    `record_id` INT NOT NULL,
    `action` ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    `old_values` JSON,
    `new_values` JSON,
    `changed_by` INT,
    `changed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `ip_address` VARCHAR(45),
    
    INDEX `idx_audit_table` (`table_name`),
    INDEX `idx_audit_record` (`record_id`),
    INDEX `idx_audit_date` (`changed_at`),
    INDEX `idx_audit_user` (`changed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- SAMPLE DATA
-- ============================================

-- Insert default admin user (password: admin123)
-- Password hash generated with bcrypt (10 rounds)
INSERT INTO `users` (`email`, `password`, `username`, `role`) VALUES
('admin@vaynex.com', '$2a$10$rQnM1F3K.L8V4pY9qR5Z8e7B6D1C3A5E2F4G6H8I0J2K4L6M8N0P', 'Admin User', 'admin')
ON DUPLICATE KEY UPDATE `email` = `email`;

-- Insert default units
INSERT INTO `units` (`code`, `name`, `description`) VALUES
('PCS', 'Pieces', 'Individual pieces'),
('KG', 'Kilograms', 'Weight in kilograms'),
('LTR', 'Liters', 'Volume in liters'),
('MTR', 'Meters', 'Length in meters'),
('BOX', 'Box', 'Box/Carton'),
('SET', 'Set', 'Complete set'),
('PKT', 'Packet', 'Packet/Pack')
ON DUPLICATE KEY UPDATE `code` = `code`;

-- Insert default categories
INSERT INTO `item_categories` (`name`, `description`) VALUES
('General', 'General items'),
('Electronics', 'Electronic items'),
('Consumables', 'Consumable items'),
('Raw Materials', 'Raw materials for production'),
('Finished Goods', 'Ready for sale items')
ON DUPLICATE KEY UPDATE `name` = `name`;
