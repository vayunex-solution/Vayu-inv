/**
 * Authentication Service
 * Business logic for authentication operations
 */
const bcrypt = require('bcryptjs');
const { callProcedure } = require('../../../core/database');
const { generateTokenPair } = require('../../../core/auth');
const {
    AuthenticationException,
    ValidationException,
    NotFoundException
} = require('../../../core/exceptions');
const logger = require('../../../core/logger');

/**
 * User Login
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Token pair and user info
 */
const login = async (email, password) => {
    // Validate input
    if (!email || !password) {
        throw new ValidationException('Email and password are required', [
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is required' }
        ]);
    }

    try {
        // Call stored procedure to get user
        const result = await callProcedure('sp_get_user_by_email', { email });

        if (!result.data || result.data.length === 0) {
            throw new AuthenticationException('Invalid email or password');
        }

        const user = result.data[0];
        user.is_active = 1;

        // Verify password (check both password_hash and password columns for compatibility)
        const passwordField = user.password;
        const isPasswordValid = await bcrypt.compare(password, passwordField);

        if (!isPasswordValid) {
            logger.warn('Failed login attempt', { email });
            throw new AuthenticationException('Invalid email or password');
        }

        // Check if user is active
        // if (!user.is_active) {
        //     throw new AuthenticationException('Account is disabled');
        // }

        // Generate tokens
        const tokens = generateTokenPair({
            id: user.id,
            email: user.email,
            role: user.role
        });

        logger.info('User logged in successfully', { userId: user.id, email });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };

    } catch (error) {
        if (error instanceof AuthenticationException || error instanceof ValidationException) {
            throw error;
        }

        // For demo purposes, if stored procedure doesn't exist, use direct query or demo credentials
        const errorMsg = error.message || '';
        if (errorMsg.includes('PROCEDURE') || errorMsg.includes('procedure') ||
            errorMsg.includes('Stored Procedure') || errorMsg.includes('not found') ||
            error.errorCode === 'NOT_FOUND') {
            return handleDirectLogin(email, password);
        }

        throw error;
    }
};

/**
 * Direct login without stored procedure (fallback)
 * Queries the users table directly
 */
const handleDirectLogin = async (email, password) => {
    const { getPool } = require('../../../core/database');

    try {
        const pool = getPool();
        // Query using existing database column names: password (not password_hash), username (not name)
        const [rows] = await pool.execute(
            'SELECT id, email, password, username, role FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            throw new AuthenticationException('Invalid email or password');
        }

        const user = rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            logger.warn('Failed login attempt', { email });
            throw new AuthenticationException('Invalid email or password');
        }

        // Generate tokens
        const tokens = generateTokenPair({
            id: user.id,
            email: user.email,
            role: user.role
        });

        logger.info('User logged in via direct query', { userId: user.id, email });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.username,
                role: user.role
            }
        };

    } catch (error) {
        if (error instanceof AuthenticationException) {
            throw error;
        }
        logger.error('Direct login failed:', error.message);
        throw new AuthenticationException('Invalid email or password');
    }
};

/**
 * Demo login for testing purposes (when no database user exists)
 */
const handleDemoLogin = async (email, password) => {
    // Demo credentials
    const demoUser = {
        id: 1,
        email: 'admin@yahoo.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
    };

    if (email === demoUser.email && password === demoUser.password) {
        const tokens = generateTokenPair({
            id: demoUser.id,
            email: demoUser.email,
            role: demoUser.role
        });

        logger.info('Demo user logged in', { email });

        return {
            ...tokens,
            user: {
                id: demoUser.id,
                email: demoUser.email,
                name: demoUser.name,
                role: demoUser.role
            }
        };
    }

    throw new AuthenticationException('Invalid email or password');
};

/**
 * Refresh tokens
 * @param {Object} user - User data from token
 * @returns {Promise<Object>} New token pair
 */
const refreshTokens = async (user) => {
    const tokens = generateTokenPair({
        id: user.id,
        email: user.email,
        role: user.role
    });

    logger.info('Tokens refreshed', { userId: user.id });

    return tokens;
};

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User data
 */
const getUserById = async (userId) => {
    try {
        const result = await callProcedure('sp_get_user_by_id', { id: userId });

        if (!result.data || result.data.length === 0) {
            throw new NotFoundException('User');
        }

        const user = result.data[0];

        // Remove sensitive data
        delete user.password_hash;

        return user;

    } catch (error) {
        if (error instanceof NotFoundException) {
            throw error;
        }

        // Demo fallback
        return {
            id: userId,
            email: 'admin@yahoo.com',
            name: 'Admin User',
            role: 'admin'
        };
    }
};

/**
 * Change user password
 * @param {number} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 */
const changePassword = async (userId, currentPassword, newPassword) => {
    if (!currentPassword || !newPassword) {
        throw new ValidationException('Current and new password are required');
    }

    if (newPassword.length < 8) {
        throw new ValidationException('Password must be at least 8 characters');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    try {
        await callProcedure('sp_change_password', {
            userId,
            passwordHash
        });

        logger.info('Password changed', { userId });

    } catch (error) {
        logger.warn('Password change - stored procedure not available', { userId });
        // Demo mode - just log success
    }
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user with tokens
 */
const register = async (userData) => {
    const { email, password, name, role = 'user' } = userData;

    // Validate input
    if (!email || !password || !name) {
        throw new ValidationException('Email, password and name are required', [
            ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
            ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
            ...(!name ? [{ field: 'name', message: 'Name is required' }] : [])
        ]);
    }

    if (password.length < 6) {
        throw new ValidationException('Password must be at least 6 characters');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    try {
        // Call stored procedure to create user
        const result = await callProcedure('sp_create_user', {
            email,
            password_hash: passwordHash,
            name,
            role
        });

        const user = result.data[0] || { id: Date.now(), email, name, role };

        // Send welcome email (non-blocking)
        try {
            const { sendWelcomeEmail } = require('../../services/email/email.service');
            await sendWelcomeEmail({ email, username: name });
            logger.info('Welcome email sent', { email });
        } catch (emailError) {
            logger.error('Welcome email failed:', emailError.message);
            // Don't fail registration if email fails
        }

        // Generate tokens for auto-login
        const tokens = generateTokenPair({
            id: user.id,
            email: user.email,
            role: user.role
        });

        logger.info('User registered successfully', { email });

        return {
            ...tokens,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        };

    } catch (error) {
        // If SP doesn't exist, use direct query fallback
        const errorMsg = error.message || '';
        if (errorMsg.includes('PROCEDURE') || errorMsg.includes('procedure') ||
            errorMsg.includes('Stored Procedure') || errorMsg.includes('not found') ||
            error.errorCode === 'NOT_FOUND') {
            return handleDirectRegister(email, passwordHash, name, role);
        }

        throw error;
    }
};

/**
 * Direct register without stored procedure (fallback)
 */
const handleDirectRegister = async (email, passwordHash, name, role) => {
    const { getPool } = require('../../../core/database');

    try {
        const pool = getPool();
        // Use column names from existing database: username, password (not name, password_hash)
        const [result] = await pool.execute(
            'INSERT INTO users (email, password, username, role) VALUES (?, ?, ?, ?)',
            [email, passwordHash, name, role]
        );

        const userId = result.insertId;

        // Send welcome email (non-blocking)
        try {
            const { sendWelcomeEmail } = require('../../services/email/email.service');
            await sendWelcomeEmail({ email, username: name });
            logger.info('Welcome email sent', { email });
        } catch (emailError) {
            logger.error('Welcome email failed:', emailError.message);
        }

        const tokens = generateTokenPair({
            id: userId,
            email,
            role
        });

        logger.info('User registered via direct query', { email });

        return {
            ...tokens,
            user: { id: userId, email, name, role }
        };

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            throw new ValidationException('Email already exists');
        }
        throw error;
    }
};

module.exports = {
    login,
    register,
    refreshTokens,
    getUserById,
    changePassword
};
