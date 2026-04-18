require('dotenv').config();
const { getPool } = require('./src/core/database');

async function getSpBody() {
    const pool = getPool();
    const conn = await pool.getConnection();

    const spNames = ['usp_unitsmaster_list', 'usp_unitsmaster_insupd'];

    for (const sp of spNames) {
        console.log('\n' + '='.repeat(70));
        console.log(`SP: ${sp}`);
        console.log('='.repeat(70));
        try {
            const [rows] = await conn.execute(
                `SELECT ROUTINE_DEFINITION FROM INFORMATION_SCHEMA.ROUTINES 
                 WHERE ROUTINE_SCHEMA = 'vayunexs_inventory_db' AND ROUTINE_NAME = ?`,
                [sp]
            );
            if (rows[0] && rows[0].ROUTINE_DEFINITION) {
                console.log(rows[0].ROUTINE_DEFINITION);
            } else {
                console.log('⚠️  No body found or access denied');
            }
        } catch (e) {
            console.error('Error:', e.message);
        }
    }

    conn.release();
    process.exit();
}

getSpBody();
