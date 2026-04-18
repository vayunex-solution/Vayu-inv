require('dotenv').config();
const { getPool } = require('./src/core/database');

async function testSp() {
    const pool = getPool();
    const conn = await pool.getConnection();

    try {
        const [r] = await conn.execute("SHOW CREATE PROCEDURE usp_unitsmaster_list");
        console.log("SHOW CREATE PROCEDURE result:", r);
    } catch (e) {
        console.error('Error:', e.message);
    }
    
    try {
        const [r2] = await conn.execute("SHOW CREATE PROCEDURE `usp_unitsmaster_list`");
        console.log("SHOW CREATE PROCEDURE (backticks) result:", r2);
    } catch(e) {
        console.error('Error 2:', e.message);
    }

    conn.release();
    process.exit();
}
testSp();
