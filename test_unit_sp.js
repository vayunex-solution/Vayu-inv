require('dotenv').config();
const { getPool } = require('./src/core/database');

async function test() {
    const pool = getPool();
    const conn = await pool.getConnection();
    try {
        // Direct call with multi params
        const [r] = await conn.execute('CALL usp_unitsmaster_list(?, ?, ?, ?, ?)', [2, '', 0, 0, 100]);
        console.log('SUCCESS - result sets:', r.length);
        console.log('First set rows:', r[0]?.length);
        if (r[0] && r[0][0]) console.log('Sample row:', JSON.stringify(r[0][0]));
    } catch (e) {
        console.error('ERROR CODE:', e.code);
        console.error('ERROR errno:', e.errno);
        console.error('ERROR MSG:', e.message);
        console.error('SQL MSG:', e.sqlMessage);
        console.error('SQL STATE:', e.sqlState);
    } finally {
        conn.release();
        process.exit();
    }
}
test();
