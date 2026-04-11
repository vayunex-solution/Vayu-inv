const { getPool } = require('./src/core/database');

async function test() {
    const pool = getPool();
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.execute(`
            SELECT ROUTINE_NAME 
            FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_SCHEMA = 'vayunexs_inventory_db' 
            AND ROUTINE_NAME LIKE 'usp_unitsmaster%'
        `);
        console.log("Found SPs:", rows);
    } catch(e) {
        console.error(e);
    } finally {
        if(conn) conn.release();
        process.exit();
    }
}
test();
