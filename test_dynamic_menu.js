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

        // List all menus to debug
        const [rows] = await conn.execute('SELECT id, menu_key, title FROM app_menus');
        console.log('Current Menus:', rows);

        console.log('Updating ID 4 to "Settings.." ...');
        
        const [result] = await conn.execute(
            'UPDATE app_menus SET title = ? WHERE id = ?',
            ['Settings..', 4]
        );

        console.log(`Rows affected: ${result.affectedRows}`);
        
        if (result.affectedRows > 0) {
            console.log('✅ Menu updated! Now check the Frontend UI.');
        } else {
            console.log('❌ Failed to update. Check if menu_key "settings" exists.');
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        if (conn) await conn.end();
    }
})();
