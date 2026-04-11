const { getPool } = require('./src/core/database');

async function test() {
    const pool = getPool();
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'vayunexs_inventory_db' 
            AND TABLE_NAME LIKE '%unit%'
        `);
        console.log("Found tables:", rows);
    } catch(e) {
        console.error(e);
    } finally {
        if(conn) conn.release();
        process.exit();
    }
}
test();
