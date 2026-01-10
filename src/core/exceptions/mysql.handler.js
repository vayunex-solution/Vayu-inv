/**
 * MySQL Exception Handler
 * Maps MySQL error codes to application exceptions
 */
const {
    DatabaseException,
    ValidationException,
    ConflictException,
    NotFoundException
} = require('./app.exception');

/**
 * MySQL Error Codes Reference
 */
const MYSQL_ERROR_CODES = {
    // Connection errors
    ECONNREFUSED: 'CONNECTION_REFUSED',
    PROTOCOL_CONNECTION_LOST: 'CONNECTION_LOST',
    ER_ACCESS_DENIED_ERROR: 'ACCESS_DENIED',

    // Constraint errors
    ER_DUP_ENTRY: 'DUPLICATE_ENTRY',
    ER_NO_REFERENCED_ROW: 'FOREIGN_KEY_VIOLATION',
    ER_NO_REFERENCED_ROW_2: 'FOREIGN_KEY_VIOLATION',
    ER_ROW_IS_REFERENCED: 'REFERENCED_ROW',
    ER_ROW_IS_REFERENCED_2: 'REFERENCED_ROW',

    // Data errors
    ER_DATA_TOO_LONG: 'DATA_TOO_LONG',
    ER_TRUNCATED_WRONG_VALUE: 'INVALID_VALUE',
    ER_BAD_NULL_ERROR: 'NULL_VIOLATION',

    // Procedure errors
    ER_SP_DOES_NOT_EXIST: 'PROCEDURE_NOT_FOUND',
    ER_SP_WRONG_NO_OF_ARGS: 'INVALID_ARGUMENTS',

    // Table errors
    ER_NO_SUCH_TABLE: 'TABLE_NOT_FOUND',
    ER_BAD_FIELD_ERROR: 'COLUMN_NOT_FOUND'
};

/**
 * MySQL Exception Handler Class
 */
class MySQLExceptionHandler {
    /**
     * Handle MySQL error and convert to application exception
     * @param {Error} error - MySQL error
     * @returns {AppException} Application exception
     */
    static handle(error) {
        const errorCode = error.code || error.errno;

        // Connection errors
        if (errorCode === 'ECONNREFUSED' || errorCode === 'PROTOCOL_CONNECTION_LOST') {
            return new DatabaseException(
                'Database connection failed. Please try again later.',
                error
            );
        }

        // Access denied
        if (errorCode === 'ER_ACCESS_DENIED_ERROR') {
            return new DatabaseException(
                'Database access denied. Check credentials.',
                error
            );
        }

        // Duplicate entry
        if (errorCode === 'ER_DUP_ENTRY') {
            const match = error.message.match(/Duplicate entry '(.+)' for key '(.+)'/);
            const value = match ? match[1] : 'value';
            const key = match ? match[2] : 'field';
            return new ConflictException(
                `Duplicate entry: ${value} already exists for ${key}`
            );
        }

        // Foreign key violations
        if (errorCode === 'ER_NO_REFERENCED_ROW' || errorCode === 'ER_NO_REFERENCED_ROW_2') {
            return new ValidationException(
                'Referenced record does not exist',
                [{ field: 'foreign_key', message: 'Invalid reference' }]
            );
        }

        // Cannot delete referenced row
        if (errorCode === 'ER_ROW_IS_REFERENCED' || errorCode === 'ER_ROW_IS_REFERENCED_2') {
            return new ConflictException(
                'Cannot delete record. It is referenced by other records.'
            );
        }

        // Data too long
        if (errorCode === 'ER_DATA_TOO_LONG') {
            const match = error.message.match(/Data too long for column '(.+)'/);
            const column = match ? match[1] : 'field';
            return new ValidationException(
                `Data too long for ${column}`,
                [{ field: column, message: 'Value exceeds maximum length' }]
            );
        }

        // Null violation
        if (errorCode === 'ER_BAD_NULL_ERROR') {
            const match = error.message.match(/Column '(.+)' cannot be null/);
            const column = match ? match[1] : 'field';
            return new ValidationException(
                `${column} is required`,
                [{ field: column, message: 'This field cannot be null' }]
            );
        }

        // Procedure not found
        if (errorCode === 'ER_SP_DOES_NOT_EXIST') {
            return new NotFoundException('Stored Procedure');
        }

        // Table not found
        if (errorCode === 'ER_NO_SUCH_TABLE') {
            return new DatabaseException('Database table not found', error);
        }

        // Default: wrap in DatabaseException
        return new DatabaseException(
            error.sqlMessage || error.message || 'Database operation failed',
            error
        );
    }

    /**
     * Check if error is a MySQL error
     * @param {Error} error - Error to check
     * @returns {boolean} True if MySQL error
     */
    static isMySQLError(error) {
        return error.code && (
            error.code.startsWith('ER_') ||
            error.code === 'ECONNREFUSED' ||
            error.code === 'PROTOCOL_CONNECTION_LOST'
        );
    }
}

module.exports = { MySQLExceptionHandler, MYSQL_ERROR_CODES };
