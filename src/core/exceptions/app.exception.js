/**
 * Custom Application Exceptions
 * Centralized exception classes for the application
 */

/**
 * Base Application Exception
 */
class AppException extends Error {
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            success: false,
            error: {
                code: this.errorCode,
                message: this.message
            }
        };
    }
}

/**
 * Validation Exception - 400
 */
class ValidationException extends AppException {
    constructor(message = 'Validation failed', errors = []) {
        super(message, 400, 'VALIDATION_ERROR');
        this.errors = errors;
    }

    toJSON() {
        return {
            success: false,
            error: {
                code: this.errorCode,
                message: this.message,
                details: this.errors
            }
        };
    }
}

/**
 * Authentication Exception - 401
 */
class AuthenticationException extends AppException {
    constructor(message = 'Authentication failed') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

/**
 * Authorization Exception - 403
 */
class AuthorizationException extends AppException {
    constructor(message = 'Access denied') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

/**
 * Not Found Exception - 404
 */
class NotFoundException extends AppException {
    constructor(resource = 'Resource', message = null) {
        super(message || `${resource} not found`, 404, 'NOT_FOUND');
        this.resource = resource;
    }
}

/**
 * Conflict Exception - 409
 */
class ConflictException extends AppException {
    constructor(message = 'Resource conflict') {
        super(message, 409, 'CONFLICT_ERROR');
    }
}

/**
 * Database Exception - 500
 */
class DatabaseException extends AppException {
    constructor(message = 'Database operation failed', originalError = null) {
        super(message, 500, 'DATABASE_ERROR');
        this.originalError = originalError;
    }
}

/**
 * Service Unavailable Exception - 503
 */
class ServiceUnavailableException extends AppException {
    constructor(message = 'Service temporarily unavailable') {
        super(message, 503, 'SERVICE_UNAVAILABLE');
    }
}

module.exports = {
    AppException,
    ValidationException,
    AuthenticationException,
    AuthorizationException,
    NotFoundException,
    ConflictException,
    DatabaseException,
    ServiceUnavailableException
};
