/**
 * Database Module Index
 * Exports all database utilities
 */
const { createPool, getPool, testConnection, closePool, getConnection } = require('./connection');
const { callProcedure, callProcedureMultiParam, callProcedureWithOutput } = require('./procedure');

module.exports = {
    // Connection management
    createPool,
    getPool,
    testConnection,
    closePool,
    getConnection,

    // Stored procedure utilities
    callProcedure,
    callProcedureMultiParam,
    callProcedureWithOutput,

    // Raw Query
    query: async (sql, params) => {
        const pool = await getPool();
        const [rows] = await pool.execute(sql, params);
        return rows;
    }
};
