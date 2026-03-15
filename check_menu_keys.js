// Script to check menu_key values in app_menus table
require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkMenuKeys() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    const [rows] = await conn.execute(
        'SELECT id, menu_key, title, url, parent_id FROM app_menus WHERE is_active = 1 ORDER BY sort_order ASC'
    );
    
    console.log('\n=== APP MENUS (menu_key is the component mapping key) ===\n');
    rows.forEach(r => {
        console.log(`menu_key: "${r.menu_key}" | title: "${r.title}" | parent_id: ${r.parent_id}`);
    });

    await conn.end();
}

checkMenuKeys().catch(console.error);
