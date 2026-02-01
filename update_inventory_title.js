const mysql = require('mysql2/promise');
require('dotenv').config();

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

        // List initial state
        const [before] = await conn.execute('SELECT id, title FROM app_menus WHERE id = 2');
        console.log('Current Title:', before[0].title);

        console.log('Updating "Inventory" to "Manage Stocks" ...');
        
        // Update Inventory (ID 2)
        await conn.execute('UPDATE app_menus SET title = ? WHERE id = 2', ['Manage Stocks']);
        
        // Update Settings back to normal to keep it clean, or keep it dirty? User said "kch changes kro".
        // Let's keep Settings.. as is for now to not confuse tests.

        // Verify update
        const [after] = await conn.execute('SELECT id, title FROM app_menus WHERE id = 2');
        console.log('New Title:', after[0].title);

        console.log('✅ Update Complete! Please Refresh your Browser (Ctrl+Shift+R).');

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        if (conn) await conn.end();
    }
})();
