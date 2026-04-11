const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkRoutines() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- Testing call to usp_itemcategory_list ---');
        try {
            const [results] = await connection.execute('CALL usp_itemcategory_list(?, ?)', [2, 0]);
            console.log('SUCCESS! Call finished without error.');
            console.log('Result length:', results.length);
        } catch (err) {
            console.error('CALL FAILED:', err.message);
            console.error('Error Code:', err.code);
        }

        console.log('\n--- Checking Current DataBase ---');
        const [db] = await connection.execute('SELECT DATABASE() as db');
        console.log('Current DB:', db[0].db);

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkRoutines();
