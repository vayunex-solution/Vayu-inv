-- Protocol for Dynamic Menu System

-- 1. Table Structure
CREATE TABLE `app_menus` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `menu_key` VARCHAR(50) NOT NULL UNIQUE,  -- Unique key for frontend logic (e.g., 'dashboard', 'inventory')
    `title` VARCHAR(100) NOT NULL,           -- Display label
    `icon` VARCHAR(50) DEFAULT NULL,         -- Lucide icon name (e.g., 'LayoutDashboard')
    `url` VARCHAR(255) DEFAULT NULL,         -- Route path (e.g., '/inventory/items')
    `parent_id` INT DEFAULT NULL,            -- Parent menu ID for nesting
    `sort_order` INT DEFAULT 0,              -- Display order
    `is_active` BOOLEAN DEFAULT TRUE,        -- Soft delete/hide
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (`parent_id`) REFERENCES `app_menus`(`id`) ON DELETE CASCADE
);

-- 2. Indexes for Performance
CREATE INDEX idx_menu_parent ON app_menus(parent_id);
CREATE INDEX idx_menu_order ON app_menus(sort_order);

-- 3. Sample Data (Matching current menu.json)
-- Root Items
INSERT INTO `app_menus` (`id`, `menu_key`, `title`, `icon`, `url`, `parent_id`, `sort_order`) VALUES
(1, 'dashboard', 'Dashboard', 'LayoutDashboard', '/dashboard', NULL, 1),
(2, 'inventory', 'Inventory', 'Package', NULL, NULL, 2),
(3, 'reports', 'Reports', 'FileText', NULL, NULL, 3),
(4, 'settings', 'Settings', 'Settings', '/settings', NULL, 4);

-- Inventory Children
INSERT INTO `app_menus` (`menu_key`, `title`, `icon`, `url`, `parent_id`, `sort_order`) VALUES
('items', 'Items', 'Box', '/inventory/items', 2, 1),
('categories', 'Categories', 'Tags', '/inventory/categories', 2, 2),
('units', 'Units', 'Ruler', '/inventory/units', 2, 3),
('stock', 'Stock Transactions', 'ArrowLeftRight', '/inventory/stock', 2, 4);

-- Reports Children
INSERT INTO `app_menus` (`menu_key`, `title`, `icon`, `url`, `parent_id`, `sort_order`) VALUES
('stock-report', 'Stock Report', 'ClipboardList', '/reports/stock', 3, 1),
('low-stock', 'Low Stock Alert', 'AlertTriangle', '/reports/low-stock', 3, 2);
