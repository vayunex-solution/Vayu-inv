/**
 * MySQL Database Connection Module
 * Creates connection pool and handles connection lifecycle
 */
const mysql = require('mysql2/promise');
const { config } = require('../config');
const logger = require('../logger');

let pool = null;

/**
 * Create MySQL connection pool
 * @returns {mysql.Pool} MySQL connection pool
 */
const createPool = () => {
    if (pool) {
        return pool;
    }

    pool = mysql.createPool({
        host: config.database.host,
        port: config.database.port,
        user: config.database.user,
        password: config.database.password,
        database: config.database.database,
        connectionLimit: config.database.connectionLimit,
        waitForConnections: config.database.waitForConnections,
        queueLimit: config.database.queueLimit,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });

    logger.info('MySQL connection pool created');
    return pool;
};

/**
 * Get the connection pool
 * @returns {mysql.Pool} MySQL connection pool
 */
const getPool = () => {
    if (!pool) {
        return createPool();
    }
    return pool;
};

/**
 * Test database connection
 * Must be called at application startup
 * @throws {Error} If connection fails
 */
const testConnection = async () => {
    try {
        const connection = await getPool().getConnection();
        logger.info(`Successfully connected to MySQL database: ${config.database.database}`);
        connection.release();
        return true;
    } catch (error) {
        logger.error('Failed to connect to MySQL database:', error.message);
        throw error;
    }
};

/**
 * Close all connections in the pool
 */
const closePool = async () => {
    if (pool) {
        await pool.end();
        pool = null;
        logger.info('MySQL connection pool closed');
    }
};

/**
 * Get a connection from the pool
 * @returns {Promise<mysql.PoolConnection>} Database connection
 */
const getConnection = async () => {
    return await getPool().getConnection();
};

module.exports = {
    createPool,
    getPool,
    testConnection,
    closePool,
    getConnection
};
