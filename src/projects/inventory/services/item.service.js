/**
 * Item Service
 * Business logic for item management
 * Supports HSN Code, Tax Rate, Barcode fields
 */
const { callProcedure } = require('../../../core/database');
const { NotFoundException } = require('../../../core/exceptions');
const logger = require('../../../core/logger');
const { ItemModel } = require('../models/item.model');

/**
 * Get all items with pagination and filters
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Items and pagination
 */
const getItems = async (params = {}) => {
    const {
        page = 1,
        limit = 10,
        search = '',
        category_id = null,
        status = null,
        sort_by = 'id',
        sort_order = 'desc',
        hsn_code = null
    } = params;

    const input = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        category_id,
        status,
        sort_by,
        sort_order,
        hsn_code
    };

    logger.debug('Fetching items from database', input);

    try {
        const result = await callProcedure('sp_get_items', input);
        const items = result.data || [];

        return {
            items,
            pagination: {
                page: input.page,
                limit: input.limit,
                total: items.length > 0 ? items[0]?.total_count || items.length : 0
            }
        };
    } catch (error) {
        logger.error('Error fetching items from database', { error: error.message });
        throw error;
    }
};

/**
 * Get item by ID
 * @param {number} id - Item ID
 * @returns {Promise<Object>} Item data
 */
const getItemById = async (id) => {
    logger.debug('Fetching item by ID from database', { id });

    try {
        const result = await callProcedure('sp_get_item_by_id', { id });

        if (!result.data || result.data.length === 0) {
            throw new NotFoundException('Item not found in database');
        }

        return result.data[0];
    } catch (error) {
        logger.error('Error fetching item by ID', { id, error: error.message });
        throw error;
    }
};

/**
 * Create new item
 * @param {Object} data - Item data
 * @returns {Promise<Object>} Created item
 */
const createItem = async (data) => {
    const itemModel = new ItemModel(data);
    itemModel.validateForCreate();

    logger.info('Creating item in database', { item_code: data.item_code });

    try {
        const result = await callProcedure('sp_create_item', itemModel.toCreateJSON());
        return result.data;
    } catch (error) {
        logger.error('Error creating item', { item_code: data.item_code, error: error.message });
        throw error;
    }
};

/**
 * Update item
 * @param {number} id - Item ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated item
 */
const updateItem = async (id, data) => {
    const itemModel = new ItemModel(data);
    itemModel.validateForUpdate();

    logger.info('Updating item in database', { id });

    try {
        const result = await callProcedure('sp_update_item', itemModel.toUpdateJSON(id));
        return result.data || { id, ...data, updated_at: new Date().toISOString() };
    } catch (error) {
        logger.error('Error updating item', { id, error: error.message });
        throw error;
    }
};

/**
 * Delete item
 * @param {number} id - Item ID
 * @returns {Promise<boolean>} Success status
 */
const deleteItem = async (id) => {
    logger.info('Deleting item in database', { id });

    try {
        await callProcedure('sp_delete_item', { id });
        return true;
    } catch (error) {
        logger.error('Error deleting item', { id, error: error.message });
        throw error;
    }
};

/**
 * Get item categories
 * @returns {Promise<Array>} List of categories
 */
const getCategories = async () => {
    try {
        const result = await callProcedure('sp_get_item_categories', {});
        return result.data || [];
    } catch (error) {
        logger.error('Error fetching categories from database', { error: error.message });
        throw error;
    }
};

/**
 * Search items by HSN code
 * @param {string} hsn_code - HSN code to search for
 * @returns {Promise<Array>} Items matching the HSN code
 */
const getItemsByHsnCode = async (hsn_code) => {
    try {
        const result = await callProcedure('sp_get_items_by_hsn', { hsn_code });
        return result.data || [];
    } catch (error) {
        logger.error('Error fetching items by HSN code', { hsn_code, error: error.message });
        throw error;
    }
};

/**
 * Get all unique HSN codes used in Item Master
 * @returns {Promise<Array>} List of unique HSN codes
 */
const getHsnList = async () => {
    try {
        const result = await callProcedure('sp_get_hsn_list', {});
        return result.data || [];
    } catch (error) {
        logger.error('Error fetching HSN list from database', { error: error.message });
        throw error;
    }
};

module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getCategories,
    getItemsByHsnCode,
    getHsnList
};

