/**
 * Stored Procedure Executor Module
 * Centralized handler for all stored procedure calls with JSON input
 */
const { getPool } = require('./connection');
const logger = require('../logger');
const { MySQLExceptionHandler } = require('../exceptions/mysql.handler');

/**
 * Call a stored procedure with JSON input
 * @param {string} procedureName - Name of the stored procedure
 * @param {Object} inputParams - JSON object to pass to the procedure
 * @returns {Promise<Object>} Result from the stored procedure
 */
const callProcedure = async (procedureName, inputParams = {}) => {
    const pool = getPool();
    let connection;

    try {
        connection = await pool.getConnection();

        // Convert input params to JSON string
        const jsonInput = JSON.stringify(inputParams);

        logger.debug(`Calling procedure: ${procedureName}`, { input: inputParams });

        // Execute stored procedure with JSON input
        const [results] = await connection.execute(
            `CALL ${procedureName}(?)`,
            [jsonInput]
        );

        // MySQL stored procedures return results in an array
        // The last element is typically procedure metadata
        const data = results.length > 1 ? results.slice(0, -1) : results;

        logger.debug(`Procedure ${procedureName} completed successfully`);

        return {
            success: true,
            data: data.length === 1 ? data[0] : data
        };

    } catch (error) {
        logger.error(`Procedure ${procedureName} failed:`, error.message);
        throw MySQLExceptionHandler.handle(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Call a stored procedure with multiple JSON parameters
 * @param {string} procedureName - Name of the stored procedure
 * @param {Array<Object>} inputParams - Array of JSON objects to pass
 * @returns {Promise<Object>} Result from the stored procedure
 */
const callProcedureMultiParam = async (procedureName, inputParams = []) => {
    const pool = getPool();
    let connection;

    try {
        connection = await pool.getConnection();

        // Convert params: stringify only objects/arrays, keep primitives as-is
        const processedParams = inputParams.map(param => {
            // If it's an object or array, stringify it
            if (param !== null && typeof param === 'object') {
                return JSON.stringify(param);
            }
            // Otherwise keep primitive values (numbers, strings, booleans) as-is
            return param;
        });

        // Build placeholders for parameters
        const placeholders = processedParams.map(() => '?').join(', ');

        logger.debug(`Calling procedure: ${procedureName}`, {
            inputCount: processedParams.length,
            params: processedParams
        });

        const [results] = await connection.execute(
            `CALL ${procedureName}(${placeholders})`,
            processedParams
        );

        const data = results.length > 1 ? results.slice(0, -1) : results;

        logger.debug(`Procedure ${procedureName} completed successfully`);

        return {
            success: true,
            data: data.length === 1 ? data[0] : data
        };

    } catch (error) {
        logger.error(`Procedure ${procedureName} failed:`, error.message);
        throw MySQLExceptionHandler.handle(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * Call a stored procedure that returns a single value via OUT parameter
 * @param {string} procedureName - Name of the stored procedure
 * @param {Object} inputParams - JSON object to pass to the procedure
 * @returns {Promise<Object>} Result with output value
 */
const callProcedureWithOutput = async (procedureName, inputParams = {}) => {
    const pool = getPool();
    let connection;

    try {
        connection = await pool.getConnection();

        const jsonInput = JSON.stringify(inputParams);

        logger.debug(`Calling procedure with output: ${procedureName}`);

        // Set user variable for output
        await connection.execute('SET @output_result = NULL');

        // Execute procedure
        await connection.execute(
            `CALL ${procedureName}(?, @output_result)`,
            [jsonInput]
        );

        // Retrieve output
        const [outputResult] = await connection.execute('SELECT @output_result as result');

        logger.debug(`Procedure ${procedureName} completed with output`);

        return {
            success: true,
            data: outputResult[0]?.result
        };

    } catch (error) {
        logger.error(`Procedure ${procedureName} failed:`, error.message);
        throw MySQLExceptionHandler.handle(error);
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

module.exports = {
    callProcedure,
    callProcedureMultiParam,
    callProcedureWithOutput
};
