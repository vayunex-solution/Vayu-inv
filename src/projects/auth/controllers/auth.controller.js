/**
 * Authentication Controller
 * Handles user login and token management
 */
const { asyncHandler } = require('../../../core/exceptions');
const { successResponse } = require('../../../core/utils');
const authService = require('../services/auth.service');

/**
 * User Login
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return successResponse(res, result, 'Login successful');
});

/**
 * Refresh Token
 * POST /api/v1/auth/refresh
 */
const refreshToken = asyncHandler(async (req, res) => {
    const { userId, email, role } = req.user;

    const result = await authService.refreshTokens({ id: userId, email, role });

    return successResponse(res, result, 'Token refreshed successfully');
});

/**
 * Get Current User
 * GET /api/v1/auth/me
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    const { userId } = req.user;

    const user = await authService.getUserById(userId);

    return successResponse(res, user, 'User retrieved successfully');
});

/**
 * Change Password
 * POST /api/v1/auth/change-password
 */
const changePassword = asyncHandler(async (req, res) => {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    await authService.changePassword(userId, currentPassword, newPassword);

    return successResponse(res, null, 'Password changed successfully');
});

/**
 * Register New User
 * POST /api/v1/auth/register
 */
const register = asyncHandler(async (req, res) => {
    const { email, password, name, role } = req.body;

    const result = await authService.register({ email, password, name, role });

    return successResponse(res, result, 'Registration successful', 201);
});

module.exports = {
    login,
    register,
    refreshToken,
    getCurrentUser,
    changePassword
};
