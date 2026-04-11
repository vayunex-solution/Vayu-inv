const { getPool, testConnection } = require('./src/core/database');
const fs = require('fs');

async function test() {
    try {
        await testConnection();
        const pool = getPool();
        const connection = await pool.getConnection();

        console.log("Calling usp_sequence_list_new (ActionType 2)...");
        const [results2] = await connection.execute('CALL usp_sequence_list_new(2, "", 0, 100)');
        
        console.log("Calling usp_sequence_list_new (ActionType 1) for CUSTOMER...");
        const [results1] = await connection.execute('CALL usp_sequence_list_new(1, "CUSTOMER", 0, 0)');

        fs.writeFileSync('test_seq_results.json', JSON.stringify({ 
            allResults: {
                resultsCount: results2.length,
                results: results2.slice(0, -1)
            },
            nameResults: {
                resultsCount: results1.length,
                results: results1.slice(0, -1)
            }
        }, null, 2));

        console.log("Results written to test_seq_results.json");
        connection.release();
        process.exit(0);
    } catch (err) {
        console.error(err);
        fs.writeFileSync('test_seq_error.json', JSON.stringify({ error: err.message, stack: err.stack }, null, 2));
        process.exit(1);
    }
}

test();
