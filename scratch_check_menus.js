const { getPool, query } = require('./src/core/database');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    try {
        console.log('Fetching menus...');
        const sql = `SELECT id, menu_key, title FROM app_menus WHERE title LIKE '%Account%'`;
        const rows = await query(sql);
        console.log('RESULTS:', JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error('ERROR:', err);
        process.exit(1);
    }
}

run();
