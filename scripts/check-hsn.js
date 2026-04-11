const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkHSN() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- Testing call to usp_gst_hsn_list ---');
        try {
            // Using same parameters as services/hsn/hsn.service.js
            const [results] = await connection.execute('CALL usp_gst_hsn_list(?, ?)', [2, 0]);
            console.log('SUCCESS! HSN Call finished without error.');
            console.log('Result:', JSON.stringify(results, null, 2));
        } catch (err) {
            console.error('HSN CALL FAILED:', err.message);
            console.error('Error Code:', err.code);
        }

        console.log('\n--- Checking current user & routine existence ---');
        const [routines] = await connection.execute(
            "SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = ? AND ROUTINE_NAME = 'usp_gst_hsn_list'",
            [process.env.DB_NAME]
        );
        console.log('Found in metadata:', routines.length > 0 ? 'YES' : 'NO');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await connection.end();
    }
}

checkHSN();
