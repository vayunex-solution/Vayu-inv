require('dotenv').config();
const { getPool } = require('./src/core/database');

async function testBoth() {
    const pool = getPool();
    const conn = await pool.getConnection();
    
    console.log('\n========== UNIT SP TEST ==========');
    try {
        const [r] = await conn.execute('CALL usp_unitsmaster_list(?, ?, ?, ?, ?)', [2, '', 0, 0, 100]);
        console.log('✅ usp_unitsmaster_list - SUCCESS');
        console.log('   Result sets:', r.length);
        console.log('   Row count:', r[0]?.length);
        if (r[0]?.[0]) console.log('   Sample:', JSON.stringify(r[0][0]));
    } catch (e) {
        console.log('❌ usp_unitsmaster_list - FAILED');
        console.log('   Code:', e.code, '| errno:', e.errno);
        console.log('   Message:', e.sqlMessage || e.message);
    }

    console.log('\n========== CHECK - SP EXISTS ==========');
    try {
        const [sps] = await conn.execute(`
            SELECT ROUTINE_NAME FROM INFORMATION_SCHEMA.ROUTINES 
            WHERE ROUTINE_SCHEMA = 'vayunexs_inventory_db' 
            AND ROUTINE_NAME IN ('usp_unitsmaster_list', 'usp_unitsmaster_insupd', 'usp_items_master_list', 'usp_items_master_insupd')
            ORDER BY ROUTINE_NAME
        `);
        console.log('Found SPs:', sps.map(r => r.ROUTINE_NAME));
    } catch (e) {
        console.log('SP check failed:', e.message);
    }

    console.log('\n========== ITEMS SP TEST ==========');
    try {
        const [r] = await conn.execute('CALL usp_items_master_list(?, ?, ?, ?)', [2, 0, 0, 100]);
        console.log('✅ usp_items_master_list - SUCCESS');
        console.log('   Result sets:', r.length);
        console.log('   Row count:', r[0]?.length);
        if (r[0]?.[0]) console.log('   Sample:', JSON.stringify(r[0][0]));
    } catch (e) {
        console.log('❌ usp_items_master_list - FAILED');
        console.log('   Code:', e.code, '| errno:', e.errno);
        console.log('   Message:', e.sqlMessage || e.message);
    }

    console.log('\n========== TABLE NAMES CHECK ==========');
    try {
        const [tables] = await conn.execute(`
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'vayunexs_inventory_db' 
            AND TABLE_NAME LIKE '%unit%' OR TABLE_NAME LIKE '%item%' OR TABLE_NAME LIKE '%Unit%' OR TABLE_NAME LIKE '%Item%'
        `);
        console.log('Tables found:', tables.map(t => t.TABLE_NAME));
    } catch (e) {
        console.log('Table check failed:', e.message);
    }

    conn.release();
    process.exit();
}

testBoth();
