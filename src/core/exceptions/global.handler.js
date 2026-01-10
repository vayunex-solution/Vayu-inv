/**
 * Global Exception Handler Middleware
 * Catches all unhandled errors and formats responses
 */
const logger = require('../logger');
const { AppException } = require('./app.exception');

/**
 * Not Found Handler - 404
 * Catches requests to undefined routes
 */
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: {
            code: 'NOT_FOUND',
            message: `Route ${req.method} ${req.originalUrl} not found`
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Global Error Handler
 * Catches all errors and formats consistent response
 */
const globalErrorHandler = (err, req, res, next) => {
    // Log the error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query
    });

    // Handle operational errors (known errors)
    if (err instanceof AppException) {
        return res.status(err.statusCode).json({
            ...err.toJSON(),
            timestamp: new Date().toISOString()
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token'
            },
            timestamp: new Date().toISOString()
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired'
            },
            timestamp: new Date().toISOString()
        });
    }

    // Handle syntax errors (malformed JSON)
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_JSON',
                message: 'Invalid JSON in request body'
            },
            timestamp: new Date().toISOString()
        });
    }

    // Unknown errors - don't leak internal details in production
    const isProduction = process.env.NODE_ENV === 'production';

    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message: isProduction
                ? 'An unexpected error occurred'
                : err.message
        },
        ...(isProduction ? {} : { stack: err.stack }),
        timestamp: new Date().toISOString()
    });
};

/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
    notFoundHandler,
    globalErrorHandler,
    asyncHandler
};
