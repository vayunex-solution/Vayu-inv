/**
 * Response Utility Module
 * Standard API response formatting
 */

/**
 * Success response formatter
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Created response formatter (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Success message
 */
const createdResponse = (res, data = null, message = 'Resource created successfully') => {
    return successResponse(res, data, message, 201);
};

/**
 * No content response (204)
 * @param {Object} res - Express response object
 */
const noContentResponse = (res) => {
    return res.status(204).send();
};

/**
 * Paginated response formatter
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Object} pagination - Pagination info
 * @param {string} message - Success message
 */
const paginatedResponse = (res, data = [], pagination = {}, message = 'Success') => {
    const { page = 1, limit = 10, total = 0 } = pagination;
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            total,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Error response formatter
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Error code
 * @param {Array} details - Error details
 */
const errorResponse = (res, message = 'Error', statusCode = 500, errorCode = 'ERROR', details = null) => {
    const response = {
        success: false,
        error: {
            code: errorCode,
            message
        },
        timestamp: new Date().toISOString()
    };

    if (details) {
        response.error.details = details;
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    successResponse,
    createdResponse,
    noContentResponse,
    paginatedResponse,
    errorResponse
};
