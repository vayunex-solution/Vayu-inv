const mysql = require('mysql2/promise');
require('dotenv').config();

const menuItems = [
    // Root Items
    { id: 1, menu_key: 'dashboard', title: 'Dashboard', icon: 'LayoutDashboard', url: '/dashboard', parent_id: null, sort_order: 1 },
    { id: 2, menu_key: 'inventory', title: 'Inventory', icon: 'Package', url: null, parent_id: null, sort_order: 2 },
    { id: 3, menu_key: 'reports', title: 'Reports', icon: 'FileText', url: null, parent_id: null, sort_order: 3 },
    { id: 4, menu_key: 'settings', title: 'Settings', icon: 'Settings', url: '/settings', parent_id: null, sort_order: 4 },
    
    // Inventory Children
    { menu_key: 'items', title: 'Items', icon: 'Box', url: '/inventory/items', parent_id: 2, sort_order: 1 },
    { menu_key: 'categories', title: 'Categories', icon: 'Tags', url: '/inventory/categories', parent_id: 2, sort_order: 2 },
    { menu_key: 'units', title: 'Units', icon: 'Ruler', url: '/inventory/units', parent_id: 2, sort_order: 3 },
    { menu_key: 'stock', title: 'Stock Transactions', icon: 'ArrowLeftRight', url: '/inventory/stock', parent_id: 2, sort_order: 4 },
    
    // Reports Children
    { menu_key: 'stock-report', title: 'Stock Report', icon: 'ClipboardList', url: '/reports/stock', parent_id: 3, sort_order: 1 },
    { menu_key: 'low-stock', title: 'Low Stock Alert', icon: 'AlertTriangle', url: '/reports/low-stock', parent_id: 3, sort_order: 2 }
];

(async () => {
    let conn;
    try {
        console.log('Connecting to database...');
        conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
        console.log('Connected!');

        // Check existing count
        console.log('Resetting menu data to ensure integrity...');
        
        // Disable foreign key checks to allow truncate
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('TRUNCATE TABLE app_menus');
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Table truncated.');

        console.log('Inserting default data...');
            
        for (const item of menuItems) {
            try {
                // Try insert
                // Note: explicit IDs for roots to ensure parent linking works
                if (item.id) {
                        await conn.execute(
                        `INSERT INTO app_menus (id, menu_key, title, icon, url, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [item.id, item.menu_key, item.title, item.icon, item.url, item.parent_id, item.sort_order]
                    );
                } else {
                    await conn.execute(
                        `INSERT INTO app_menus (menu_key, title, icon, url, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
                        [item.menu_key, item.title, item.icon, item.url, item.parent_id, item.sort_order]
                    );
                }
                console.log(`Inserted: ${item.title}`);
            } catch (e) {
                console.error(`Failed to insert ${item.title}:`, e.message);
            }
        }
        console.log('✅ Menu reset complete!');
        
        // Show what exists
        const [menus] = await conn.execute('SELECT id, title, parent_id, sort_order FROM app_menus ORDER BY sort_order');
        console.log('New Menus:', JSON.stringify(menus, null, 2));

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        if (conn) await conn.end();
    }
})();
