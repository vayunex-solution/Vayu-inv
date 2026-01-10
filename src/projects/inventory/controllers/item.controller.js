/**
 * Item Controller
 * HTTP request handling for item endpoints
 */
const { asyncHandler } = require('../../../core/exceptions');
const { successResponse, createdResponse, noContentResponse, paginatedResponse } = require('../../../core/utils');
const itemService = require('../services/item.service');

/**
 * Get all items
 * GET /api/v1/inventory/items
 */
const getItems = asyncHandler(async (req, res) => {
    const result = await itemService.getItems(req.query);

    return paginatedResponse(
        res,
        result.items,
        result.pagination,
        'Items retrieved successfully'
    );
});

/**
 * Get item by ID
 * GET /api/v1/inventory/items/:id
 */
const getItemById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await itemService.getItemById(parseInt(id, 10));

    return successResponse(res, item, 'Item retrieved successfully');
});

/**
 * Create new item
 * POST /api/v1/inventory/items
 */
const createItem = asyncHandler(async (req, res) => {
    const item = await itemService.createItem(req.body);

    return createdResponse(res, item, 'Item created successfully');
});

/**
 * Update item
 * PUT /api/v1/inventory/items/:id
 */
const updateItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const item = await itemService.updateItem(parseInt(id, 10), req.body);

    return successResponse(res, item, 'Item updated successfully');
});

/**
 * Delete item
 * DELETE /api/v1/inventory/items/:id
 */
const deleteItem = asyncHandler(async (req, res) => {
    const { id } = req.params;

    await itemService.deleteItem(parseInt(id, 10));

    return noContentResponse(res);
});

/**
 * Get item categories
 * GET /api/v1/inventory/categories
 */
const getCategories = asyncHandler(async (req, res) => {
    const categories = await itemService.getCategories();

    return successResponse(res, categories, 'Categories retrieved successfully');
});

module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getCategories
};
