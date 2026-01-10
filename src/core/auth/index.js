/**
 * Authentication Module Index
 * Exports all auth utilities
 */
const {
    generateToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    generateTokenPair
} = require('./jwt.service');

const {
    authenticate,
    optionalAuth,
    authorize,
    validateRefreshToken,
    extractToken
} = require('./auth.middleware');

module.exports = {
    // JWT utilities
    generateToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    generateTokenPair,

    // Middleware
    authenticate,
    optionalAuth,
    authorize,
    validateRefreshToken,
    extractToken
};
