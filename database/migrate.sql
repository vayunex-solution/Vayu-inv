-- ============================================
-- DATABASE MIGRATION SCRIPT
-- Run this script on your MySQL server
-- ============================================

-- Step 1: Create database if not exists
CREATE DATABASE IF NOT EXISTS `vayunexs_inventory_db`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `vayunexs_inventory_db`;

-- Step 2: Run schema (copy from schema.sql)
SOURCE schema.sql;

-- Step 3: Run procedures (copy from procedures.sql)
SOURCE procedures.sql;

-- ============================================
-- VERIFY INSTALLATION
-- ============================================

-- Check tables created
SELECT TABLE_NAME, TABLE_ROWS 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'vayunexs_inventory_db';

-- Check procedures created
SELECT ROUTINE_NAME, ROUTINE_TYPE 
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'vayunexs_inventory_db';

-- Test: Get demo user
CALL sp_get_user_by_email('{"email": "admin@yahoo.com"}');

-- Test: Get categories
CALL sp_get_item_categories('{}');

-- Test: Get items (empty initially)
CALL sp_get_items('{"page": 1, "limit": 10}');
