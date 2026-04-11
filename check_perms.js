const { getPool } = require('./src/core/database');

async function test() {
    const pool = getPool();
    let conn;
    try {
        conn = await pool.getConnection();
        const [rows] = await conn.execute(`CALL usp_unitsmaster_list(2, '', 0, 0, 100)`);
        console.log("Success:", rows);
    } catch(e) {
        console.error("RAW ERROR:", e);
    } finally {
        if(conn) conn.release();
        process.exit();
    }
}
test();
