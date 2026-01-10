/**
 * JWT Authentication Service
 * Token generation, validation, and management
 */
const jwt = require('jsonwebtoken');
const { config } = require('../config');
const { AuthenticationException } = require('../exceptions');
const logger = require('../logger');

/**
 * Generate access token
 * @param {Object} payload - Data to encode in token
 * @returns {string} JWT token
 */
const generateToken = (payload) => {
    try {
        const token = jwt.sign(payload, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
            issuer: 'vaynex-api'
        });

        logger.debug('Access token generated', { userId: payload.userId });
        return token;
    } catch (error) {
        logger.error('Token generation failed:', error.message);
        throw new AuthenticationException('Failed to generate token');
    }
};

/**
 * Generate refresh token
 * @param {Object} payload - Data to encode in token
 * @returns {string} JWT refresh token
 */
const generateRefreshToken = (payload) => {
    try {
        const token = jwt.sign(
            { ...payload, type: 'refresh' },
            config.jwt.secret,
            {
                expiresIn: config.jwt.refreshExpiresIn,
                issuer: 'vaynex-api'
            }
        );

        logger.debug('Refresh token generated', { userId: payload.userId });
        return token;
    } catch (error) {
        logger.error('Refresh token generation failed:', error.message);
        throw new AuthenticationException('Failed to generate refresh token');
    }
};

/**
 * Verify and decode token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, config.jwt.secret, {
            issuer: 'vaynex-api'
        });
        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AuthenticationException('Token has expired');
        }
        if (error.name === 'JsonWebTokenError') {
            throw new AuthenticationException('Invalid token');
        }
        throw new AuthenticationException('Token verification failed');
    }
};

/**
 * Decode token without verification (for inspection)
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded payload or null
 */
const decodeToken = (token) => {
    try {
        return jwt.decode(token);
    } catch (error) {
        return null;
    }
};

/**
 * Generate token pair (access + refresh)
 * @param {Object} user - User data
 * @returns {Object} Token pair
 */
const generateTokenPair = (user) => {
    const payload = {
        userId: user.id,
        email: user.email,
        role: user.role
    };

    return {
        accessToken: generateToken(payload),
        refreshToken: generateRefreshToken(payload),
        expiresIn: config.jwt.expiresIn,
        tokenType: 'Bearer'
    };
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    decodeToken,
    generateTokenPair
};
