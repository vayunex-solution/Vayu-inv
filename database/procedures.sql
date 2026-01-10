-- ============================================
-- VAYNEX INVENTORY - STORED PROCEDURES
-- All procedures accept JSON input as per API design
-- ============================================

DELIMITER //

-- ============================================
-- AUTHENTICATION PROCEDURES
-- ============================================

-- Get User by Email (for login)
DROP PROCEDURE IF EXISTS `sp_get_user_by_email`//
CREATE PROCEDURE `sp_get_user_by_email`(
    IN p_json JSON
)
BEGIN
    DECLARE v_email VARCHAR(255);
    
    -- Extract email from JSON
    SET v_email = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.email'));
    
    SELECT 
        id,
        email,
        password,
        username,
        role,
        created_at
    FROM users
    WHERE email = v_email;
END//

-- Get User by ID
DROP PROCEDURE IF EXISTS `sp_get_user_by_id`//
CREATE PROCEDURE `sp_get_user_by_id`(
    IN p_json JSON
)
BEGIN
    DECLARE v_id INT;
    
    SET v_id = JSON_EXTRACT(p_json, '$.id');
    
    SELECT 
        id,
        email,
        username,
        role,
        created_at
    FROM users
    WHERE id = v_id;
END//

-- Change Password
DROP PROCEDURE IF EXISTS `sp_change_password`//
CREATE PROCEDURE `sp_change_password`(
    IN p_json JSON
)
BEGIN
    DECLARE v_user_id INT;
    DECLARE v_password VARCHAR(255);
    
    SET v_user_id = JSON_EXTRACT(p_json, '$.userId');
    SET v_password = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.passwordHash'));
    
    UPDATE users 
    SET password = v_password
    WHERE id = v_user_id;
    
    SELECT ROW_COUNT() AS affected_rows;
END//

-- Create New User (Register)
DROP PROCEDURE IF EXISTS `sp_create_user`//
CREATE PROCEDURE `sp_create_user`(
    IN p_json JSON
)
BEGIN
    DECLARE v_email VARCHAR(255);
    DECLARE v_password VARCHAR(255);
    DECLARE v_username VARCHAR(100);
    DECLARE v_role VARCHAR(20);
    DECLARE v_new_id INT;
    
    -- Extract values from JSON
    SET v_email = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.email'));
    SET v_password = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.password_hash'));
    SET v_username = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.name'));
    SET v_role = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.role')), 'user');
    
    -- Insert new user
    INSERT INTO users (email, password, username, role)
    VALUES (v_email, v_password, v_username, v_role);
    
    SET v_new_id = LAST_INSERT_ID();
    
    -- Return created user
    SELECT 
        id,
        email,
        username,
        role,
        created_at
    FROM users
    WHERE id = v_new_id;
END//

-- ============================================
-- ITEM CATEGORY PROCEDURES
-- ============================================

-- Get All Categories
DROP PROCEDURE IF EXISTS `sp_get_item_categories`//
CREATE PROCEDURE `sp_get_item_categories`(
    IN p_json JSON
)
BEGIN
    SELECT 
        id,
        name,
        description,
        parent_id,
        is_active,
        created_at
    FROM item_categories
    WHERE is_active = 1
    ORDER BY name;
END//

-- ============================================
-- ITEM PROCEDURES
-- ============================================

-- Get Items with Pagination and Filters
DROP PROCEDURE IF EXISTS `sp_get_items`//
CREATE PROCEDURE `sp_get_items`(
    IN p_json JSON
)
BEGIN
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_limit INT DEFAULT 10;
    DECLARE v_offset INT;
    DECLARE v_search VARCHAR(255);
    DECLARE v_category_id INT;
    DECLARE v_status VARCHAR(20);
    DECLARE v_sort_by VARCHAR(50);
    DECLARE v_sort_order VARCHAR(4);
    DECLARE v_total_count INT;
    
    -- Extract parameters from JSON
    SET v_page = COALESCE(JSON_EXTRACT(p_json, '$.page'), 1);
    SET v_limit = COALESCE(JSON_EXTRACT(p_json, '$.limit'), 10);
    SET v_search = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.search'));
    SET v_category_id = JSON_EXTRACT(p_json, '$.category_id');
    SET v_status = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.status'));
    SET v_sort_by = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.sort_by')), 'id');
    SET v_sort_order = COALESCE(JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.sort_order')), 'desc');
    
    -- Calculate offset
    SET v_offset = (v_page - 1) * v_limit;
    
    -- Handle null/empty search
    IF v_search = 'null' OR v_search = '' THEN
        SET v_search = NULL;
    END IF;
    
    IF v_status = 'null' OR v_status = '' THEN
        SET v_status = NULL;
    END IF;
    
    -- Get total count
    SELECT COUNT(*) INTO v_total_count
    FROM items i
    WHERE (v_search IS NULL OR i.item_name LIKE CONCAT('%', v_search, '%') 
           OR i.item_code LIKE CONCAT('%', v_search, '%'))
      AND (v_category_id IS NULL OR i.category_id = v_category_id)
      AND (v_status IS NULL OR i.status = v_status);
    
    -- Get items with dynamic sorting
    SELECT 
        i.id,
        i.item_code,
        i.item_name,
        i.description,
        i.category_id,
        c.name AS category_name,
        u.code AS unit,
        i.unit_price,
        i.quantity,
        i.reorder_level,
        i.status,
        i.barcode,
        i.hsn_code,
        i.tax_rate,
        i.created_at,
        i.updated_at,
        v_total_count AS total_count
    FROM items i
    LEFT JOIN item_categories c ON i.category_id = c.id
    LEFT JOIN units u ON i.unit_id = u.id
    WHERE (v_search IS NULL OR i.item_name LIKE CONCAT('%', v_search, '%') 
           OR i.item_code LIKE CONCAT('%', v_search, '%'))
      AND (v_category_id IS NULL OR i.category_id = v_category_id)
      AND (v_status IS NULL OR i.status = v_status)
    ORDER BY 
        CASE WHEN v_sort_order = 'asc' THEN
            CASE v_sort_by
                WHEN 'id' THEN i.id
                WHEN 'item_code' THEN i.item_code
                WHEN 'item_name' THEN i.item_name
                WHEN 'unit_price' THEN i.unit_price
                WHEN 'quantity' THEN i.quantity
                WHEN 'created_at' THEN i.created_at
            END
        END ASC,
        CASE WHEN v_sort_order = 'desc' THEN
            CASE v_sort_by
                WHEN 'id' THEN i.id
                WHEN 'item_code' THEN i.item_code
                WHEN 'item_name' THEN i.item_name
                WHEN 'unit_price' THEN i.unit_price
                WHEN 'quantity' THEN i.quantity
                WHEN 'created_at' THEN i.created_at
            END
        END DESC
    LIMIT v_limit OFFSET v_offset;
END//

-- Get Item by ID
DROP PROCEDURE IF EXISTS `sp_get_item_by_id`//
CREATE PROCEDURE `sp_get_item_by_id`(
    IN p_json JSON
)
BEGIN
    DECLARE v_id INT;
    
    SET v_id = JSON_EXTRACT(p_json, '$.id');
    
    SELECT 
        i.id,
        i.item_code,
        i.item_name,
        i.description,
        i.category_id,
        c.name AS category_name,
        i.unit_id,
        u.code AS unit,
        i.unit_price,
        i.quantity,
        i.reorder_level,
        i.status,
        i.barcode,
        i.hsn_code,
        i.tax_rate,
        i.created_by,
        i.updated_by,
        i.created_at,
        i.updated_at
    FROM items i
    LEFT JOIN item_categories c ON i.category_id = c.id
    LEFT JOIN units u ON i.unit_id = u.id
    WHERE i.id = v_id;
END//

-- Create Item
DROP PROCEDURE IF EXISTS `sp_create_item`//
CREATE PROCEDURE `sp_create_item`(
    IN p_json JSON
)
BEGIN
    DECLARE v_item_code VARCHAR(50);
    DECLARE v_item_name VARCHAR(200);
    DECLARE v_description TEXT;
    DECLARE v_category_id INT;
    DECLARE v_unit VARCHAR(10);
    DECLARE v_unit_id INT;
    DECLARE v_unit_price DECIMAL(15, 2);
    DECLARE v_quantity DECIMAL(15, 3);
    DECLARE v_reorder_level DECIMAL(15, 3);
    DECLARE v_created_by INT;
    DECLARE v_new_id INT;
    
    -- Extract values from JSON
    SET v_item_code = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.item_code'));
    SET v_item_name = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.item_name'));
    SET v_description = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.description'));
    SET v_category_id = JSON_EXTRACT(p_json, '$.category_id');
    SET v_unit = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.unit'));
    SET v_unit_price = COALESCE(JSON_EXTRACT(p_json, '$.unit_price'), 0);
    SET v_quantity = COALESCE(JSON_EXTRACT(p_json, '$.quantity'), 0);
    SET v_reorder_level = COALESCE(JSON_EXTRACT(p_json, '$.reorder_level'), 0);
    SET v_created_by = JSON_EXTRACT(p_json, '$.created_by');
    
    -- Get unit_id from unit code
    SELECT id INTO v_unit_id FROM units WHERE code = v_unit LIMIT 1;
    
    -- Default to PCS if unit not found
    IF v_unit_id IS NULL THEN
        SELECT id INTO v_unit_id FROM units WHERE code = 'PCS' LIMIT 1;
    END IF;
    
    -- Insert the item
    INSERT INTO items (
        item_code, item_name, description, category_id, unit_id,
        unit_price, quantity, reorder_level, created_by
    ) VALUES (
        v_item_code, v_item_name, v_description, v_category_id, v_unit_id,
        v_unit_price, v_quantity, v_reorder_level, v_created_by
    );
    
    SET v_new_id = LAST_INSERT_ID();
    
    -- Log stock transaction if initial quantity > 0
    IF v_quantity > 0 THEN
        INSERT INTO stock_transactions (
            item_id, transaction_type, quantity, 
            balance_before, balance_after, remarks, created_by
        ) VALUES (
            v_new_id, 'IN', v_quantity, 
            0, v_quantity, 'Initial stock entry', v_created_by
        );
    END IF;
    
    -- Return the created item
    SELECT 
        i.id,
        i.item_code,
        i.item_name,
        i.description,
        i.category_id,
        c.name AS category_name,
        u.code AS unit,
        i.unit_price,
        i.quantity,
        i.reorder_level,
        i.status,
        i.created_at,
        i.updated_at
    FROM items i
    LEFT JOIN item_categories c ON i.category_id = c.id
    LEFT JOIN units u ON i.unit_id = u.id
    WHERE i.id = v_new_id;
END//

-- Update Item
DROP PROCEDURE IF EXISTS `sp_update_item`//
CREATE PROCEDURE `sp_update_item`(
    IN p_json JSON
)
BEGIN
    DECLARE v_id INT;
    DECLARE v_item_name VARCHAR(200);
    DECLARE v_description TEXT;
    DECLARE v_category_id INT;
    DECLARE v_unit VARCHAR(10);
    DECLARE v_unit_id INT;
    DECLARE v_unit_price DECIMAL(15, 2);
    DECLARE v_reorder_level DECIMAL(15, 3);
    DECLARE v_status VARCHAR(20);
    DECLARE v_updated_by INT;
    
    -- Extract values
    SET v_id = JSON_EXTRACT(p_json, '$.id');
    SET v_item_name = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.item_name'));
    SET v_description = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.description'));
    SET v_category_id = JSON_EXTRACT(p_json, '$.category_id');
    SET v_unit = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.unit'));
    SET v_unit_price = JSON_EXTRACT(p_json, '$.unit_price');
    SET v_reorder_level = JSON_EXTRACT(p_json, '$.reorder_level');
    SET v_status = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.status'));
    SET v_updated_by = JSON_EXTRACT(p_json, '$.updated_by');
    
    -- Get unit_id if unit provided
    IF v_unit IS NOT NULL AND v_unit != 'null' THEN
        SELECT id INTO v_unit_id FROM units WHERE code = v_unit LIMIT 1;
    END IF;
    
    -- Update item (only non-null values)
    UPDATE items SET
        item_name = COALESCE(NULLIF(v_item_name, 'null'), item_name),
        description = CASE WHEN v_description IS NOT NULL THEN NULLIF(v_description, 'null') ELSE description END,
        category_id = COALESCE(v_category_id, category_id),
        unit_id = COALESCE(v_unit_id, unit_id),
        unit_price = COALESCE(v_unit_price, unit_price),
        reorder_level = COALESCE(v_reorder_level, reorder_level),
        status = COALESCE(NULLIF(v_status, 'null'), status),
        updated_by = v_updated_by,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_id;
    
    -- Return updated item
    SELECT 
        i.id,
        i.item_code,
        i.item_name,
        i.description,
        i.category_id,
        c.name AS category_name,
        u.code AS unit,
        i.unit_price,
        i.quantity,
        i.reorder_level,
        i.status,
        i.updated_at
    FROM items i
    LEFT JOIN item_categories c ON i.category_id = c.id
    LEFT JOIN units u ON i.unit_id = u.id
    WHERE i.id = v_id;
END//

-- Delete Item (Soft Delete)
DROP PROCEDURE IF EXISTS `sp_delete_item`//
CREATE PROCEDURE `sp_delete_item`(
    IN p_json JSON
)
BEGIN
    DECLARE v_id INT;
    
    SET v_id = JSON_EXTRACT(p_json, '$.id');
    
    -- Soft delete by setting status to discontinued
    UPDATE items 
    SET status = 'discontinued',
        updated_at = CURRENT_TIMESTAMP
    WHERE id = v_id;
    
    SELECT ROW_COUNT() AS affected_rows;
END//

-- ============================================
-- STOCK MANAGEMENT PROCEDURES
-- ============================================

-- Adjust Stock (IN/OUT)
DROP PROCEDURE IF EXISTS `sp_adjust_stock`//
CREATE PROCEDURE `sp_adjust_stock`(
    IN p_json JSON
)
BEGIN
    DECLARE v_item_id INT;
    DECLARE v_transaction_type VARCHAR(10);
    DECLARE v_quantity DECIMAL(15, 3);
    DECLARE v_remarks VARCHAR(255);
    DECLARE v_created_by INT;
    DECLARE v_current_balance DECIMAL(15, 3);
    DECLARE v_new_balance DECIMAL(15, 3);
    
    SET v_item_id = JSON_EXTRACT(p_json, '$.item_id');
    SET v_transaction_type = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.transaction_type'));
    SET v_quantity = JSON_EXTRACT(p_json, '$.quantity');
    SET v_remarks = JSON_UNQUOTE(JSON_EXTRACT(p_json, '$.remarks'));
    SET v_created_by = JSON_EXTRACT(p_json, '$.created_by');
    
    -- Get current balance
    SELECT quantity INTO v_current_balance FROM items WHERE id = v_item_id;
    
    -- Calculate new balance
    IF v_transaction_type = 'IN' THEN
        SET v_new_balance = v_current_balance + v_quantity;
    ELSEIF v_transaction_type = 'OUT' THEN
        SET v_new_balance = v_current_balance - v_quantity;
        
        -- Prevent negative stock
        IF v_new_balance < 0 THEN
            SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock quantity';
        END IF;
    ELSE
        SET v_new_balance = v_quantity; -- For ADJUST type, set to exact value
    END IF;
    
    -- Update item quantity
    UPDATE items SET quantity = v_new_balance WHERE id = v_item_id;
    
    -- Log transaction
    INSERT INTO stock_transactions (
        item_id, transaction_type, quantity,
        balance_before, balance_after, remarks, created_by
    ) VALUES (
        v_item_id, v_transaction_type, v_quantity,
        v_current_balance, v_new_balance, v_remarks, v_created_by
    );
    
    SELECT LAST_INSERT_ID() AS transaction_id, v_new_balance AS new_balance;
END//

-- Get Stock History
DROP PROCEDURE IF EXISTS `sp_get_stock_history`//
CREATE PROCEDURE `sp_get_stock_history`(
    IN p_json JSON
)
BEGIN
    DECLARE v_item_id INT;
    DECLARE v_page INT DEFAULT 1;
    DECLARE v_limit INT DEFAULT 20;
    DECLARE v_offset INT;
    
    SET v_item_id = JSON_EXTRACT(p_json, '$.item_id');
    SET v_page = COALESCE(JSON_EXTRACT(p_json, '$.page'), 1);
    SET v_limit = COALESCE(JSON_EXTRACT(p_json, '$.limit'), 20);
    SET v_offset = (v_page - 1) * v_limit;
    
    SELECT 
        st.id,
        st.item_id,
        i.item_code,
        i.item_name,
        st.transaction_type,
        st.quantity,
        st.balance_before,
        st.balance_after,
        st.reference_type,
        st.reference_id,
        st.remarks,
        st.transaction_date,
        u.name AS created_by_name
    FROM stock_transactions st
    JOIN items i ON st.item_id = i.id
    LEFT JOIN users u ON st.created_by = u.id
    WHERE st.item_id = v_item_id
    ORDER BY st.transaction_date DESC
    LIMIT v_limit OFFSET v_offset;
END//

DELIMITER ;
