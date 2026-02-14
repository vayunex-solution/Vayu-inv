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

        console.log('Adding reset_token columns to users table...');
        
        // Check if columns exist first to avoid errors
        const [columns] = await conn.execute("SHOW COLUMNS FROM users LIKE 'reset_token'");
        
        if (columns.length === 0) {
            await conn.execute(`
                ALTER TABLE users 
                ADD COLUMN reset_token VARCHAR(255) NULL AFTER is_active,
                ADD COLUMN reset_token_expires DATETIME NULL AFTER reset_token
            `);
            console.log('✅ Columns added successfully!');
        } else {
            console.log('⚠️ Columns already exist. Skipping.');
        }

        console.log('Describing users table to verify...');
        const [rows] = await conn.execute('DESCRIBE users');
        console.table(rows);

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        if (conn) await conn.end();
    }
})();
