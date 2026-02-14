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

        const email = 'yashkr4748@gmail.com';
        console.log(`Checking for user: ${email}`);
        
        const [rows] = await conn.execute('SELECT id, username, email FROM users WHERE email = ?', [email]);
        
        if (rows.length > 0) {
            console.log('✅ User Found:', rows[0]);
        } else {
            console.log('❌ User NOT Found!');
            
            // List all users to see what's in there
            console.log('Listing first 5 users:');
            const [allUsers] = await conn.execute('SELECT id, username, email FROM users LIMIT 5');
            console.table(allUsers);
        }

    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        if (conn) await conn.end();
    }
})();
