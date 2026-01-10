# 📋 Database Recommendations & Best Practices

## 🎯 Current Implementation

### Tables Created
| Table | Purpose |
|-------|---------|
| `users` | User authentication & roles |
| `item_categories` | Hierarchical item categories |
| `units` | Units of measurement |
| `items` | Main inventory items |
| `stock_transactions` | Stock movement audit trail |
| `audit_log` | General audit logging |

### Stored Procedures Created
| Procedure | Purpose |
|-----------|---------|
| `sp_get_user_by_email` | Login authentication |
| `sp_get_items` | Paginated item listing |
| `sp_create_item` | Create new item |
| `sp_update_item` | Update existing item |
| `sp_delete_item` | Soft delete item |
| `sp_adjust_stock` | Stock IN/OUT adjustments |

---

## 🚀 Recommendations for Future

### 1. Additional Tables to Consider

```sql
-- Suppliers/Vendors
CREATE TABLE suppliers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE,
    name VARCHAR(200),
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    gst_number VARCHAR(20),
    is_active TINYINT(1) DEFAULT 1
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE,
    supplier_id INT,
    order_date DATE,
    expected_date DATE,
    status ENUM('draft', 'pending', 'received', 'cancelled'),
    total_amount DECIMAL(15,2),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
);

-- Warehouses/Locations
CREATE TABLE warehouses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) UNIQUE,
    name VARCHAR(100),
    address TEXT,
    is_default TINYINT(1) DEFAULT 0
);

-- Item Stock by Location
CREATE TABLE item_stock_locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    warehouse_id INT,
    quantity DECIMAL(15,3),
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (warehouse_id) REFERENCES warehouses(id),
    UNIQUE KEY (item_id, warehouse_id)
);
```

### 2. Performance Optimizations

```sql
-- Add composite indexes for common queries
ALTER TABLE items ADD INDEX idx_items_cat_status (category_id, status);
ALTER TABLE stock_transactions ADD INDEX idx_stock_item_date (item_id, transaction_date);

-- Partition stock_transactions by date (for large data)
ALTER TABLE stock_transactions 
PARTITION BY RANGE (YEAR(transaction_date)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION pmax VALUES LESS THAN MAXVALUE
);
```

### 3. Security Enhancements

```sql
-- Add password reset tokens
ALTER TABLE users ADD COLUMN reset_token VARCHAR(100);
ALTER TABLE users ADD COLUMN reset_token_expires TIMESTAMP;

-- Add login attempts tracking
ALTER TABLE users ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP;

-- Session management
CREATE TABLE user_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id INT,
    refresh_token VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 4. Reporting Views

```sql
-- Low stock items view
CREATE VIEW vw_low_stock_items AS
SELECT 
    i.id, i.item_code, i.item_name,
    i.quantity, i.reorder_level,
    c.name AS category
FROM items i
JOIN item_categories c ON i.category_id = c.id
WHERE i.quantity <= i.reorder_level AND i.status = 'active';

-- Stock value summary
CREATE VIEW vw_stock_value AS
SELECT 
    c.name AS category,
    COUNT(i.id) AS item_count,
    SUM(i.quantity) AS total_quantity,
    SUM(i.quantity * i.unit_price) AS total_value
FROM items i
JOIN item_categories c ON i.category_id = c.id
WHERE i.status = 'active'
GROUP BY c.id, c.name;
```

### 5. Trigger for Audit Log

```sql
DELIMITER //

CREATE TRIGGER trg_items_audit_update
AFTER UPDATE ON items
FOR EACH ROW
BEGIN
    INSERT INTO audit_log (table_name, record_id, action, old_values, new_values, changed_by)
    VALUES (
        'items',
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'item_name', OLD.item_name,
            'unit_price', OLD.unit_price,
            'quantity', OLD.quantity,
            'status', OLD.status
        ),
        JSON_OBJECT(
            'item_name', NEW.item_name,
            'unit_price', NEW.unit_price,
            'quantity', NEW.quantity,
            'status', NEW.status
        ),
        NEW.updated_by
    );
END//

DELIMITER ;
```

---

## 📊 Stored Procedure Patterns

### Standard Response Pattern
All SPs follow this pattern:
```sql
-- Input: JSON parameter
-- Output: Result set with data
-- Error: SIGNAL with custom message
```

### Example: Adding New Procedure
```sql
DROP PROCEDURE IF EXISTS sp_new_feature//
CREATE PROCEDURE sp_new_feature(IN p_json JSON)
BEGIN
    -- 1. Extract parameters
    DECLARE v_param VARCHAR(100);
    SET v_param = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.param'));
    
    -- 2. Validate
    IF v_param IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'param is required';
    END IF;
    
    -- 3. Execute logic
    -- ...
    
    -- 4. Return result
    SELECT 'success' AS status;
END//
```

---

## 🔧 Maintenance Scripts

```sql
-- Clean old audit logs (keep 6 months)
DELETE FROM audit_log WHERE changed_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Reindex tables
OPTIMIZE TABLE items, stock_transactions, audit_log;

-- Check table sizes
SELECT 
    table_name,
    ROUND(data_length/1024/1024, 2) AS data_mb,
    ROUND(index_length/1024/1024, 2) AS index_mb
FROM information_schema.tables
WHERE table_schema = 'vayunexs_inventory_db';
```

---

## ✅ Next Steps

1. **Run Migration**: Execute `migrate.sql` on your MySQL server
2. **Generate Password Hash**: Use bcrypt to create real admin password
3. **Add Suppliers**: Create supplier management module
4. **Add Purchase Orders**: Create PO workflow
5. **Add Reporting**: Create dashboard reports

---

## 📁 File Structure

```
database/
├── schema.sql        # Table definitions
├── procedures.sql    # Stored procedures
├── migrate.sql       # Migration script
└── RECOMMENDATIONS.md # This file
```
