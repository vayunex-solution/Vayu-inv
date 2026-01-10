/**
 * Authentication Middleware
 * Protects routes with JWT bearer token validation
 */
const { verifyToken } = require('./jwt.service');
const { AuthenticationException, AuthorizationException } = require('../exceptions');
const logger = require('../logger');

/**
 * Extract bearer token from Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} Token or null
 */
const extractToken = (req) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return null;
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
        return null;
    }

    return parts[1];
};

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
const authenticate = (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            throw new AuthenticationException('No authentication token provided');
        }

        const decoded = verifyToken(token);

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        logger.debug('User authenticated', { userId: decoded.userId });
        next();

    } catch (error) {
        next(error);
    }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require it
 */
const optionalAuth = (req, res, next) => {
    try {
        const token = extractToken(req);

        if (token) {
            const decoded = verifyToken(token);
            req.user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role
            };
        }

        next();
    } catch (error) {
        // Token invalid but optional, continue without user
        next();
    }
};

/**
 * Role-based authorization middleware factory
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {Function} Express middleware
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AuthenticationException('Authentication required'));
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn('Authorization failed', {
                userId: req.user.userId,
                role: req.user.role,
                requiredRoles: allowedRoles
            });
            return next(new AuthorizationException('Insufficient permissions'));
        }

        next();
    };
};

/**
 * Refresh token middleware
 * Validates refresh token type
 */
const validateRefreshToken = (req, res, next) => {
    try {
        const token = extractToken(req);

        if (!token) {
            throw new AuthenticationException('No refresh token provided');
        }

        const decoded = verifyToken(token);

        if (decoded.type !== 'refresh') {
            throw new AuthenticationException('Invalid refresh token');
        }

        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role
        };

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = {
    authenticate,
    optionalAuth,
    authorize,
    validateRefreshToken,
    extractToken
};
