/**
 * Exceptions Module Index
 * Exports all exception classes and handlers
 */
const {
    AppException,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    ConflictException,
    DatabaseException,
    ServiceUnavailableException
} = require('./app.exception');

const { MySQLExceptionHandler, MYSQL_ERROR_CODES } = require('./mysql.handler');
const { notFoundHandler, globalErrorHandler, asyncHandler } = require('./global.handler');

module.exports = {
    // Exception classes
    AppException,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    ConflictException,
    DatabaseException,
    ServiceUnavailableException,

    // MySQL handling
    MySQLExceptionHandler,
    MYSQL_ERROR_CODES,

    // Express middleware
    notFoundHandler,
    globalErrorHandler,
    asyncHandler
};
