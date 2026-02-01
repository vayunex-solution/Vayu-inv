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

        console.log('Updating "Settings" to "Settings.." to verify dynamic behavior...');
        
        const [result] = await conn.execute(
            'UPDATE app_menus SET title = ? WHERE menu_key = ?',
            ['Settings..', 'settings']
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
