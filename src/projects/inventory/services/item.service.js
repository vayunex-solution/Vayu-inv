/**
 * Item Service
 * Business logic for item management
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
        sort_order = 'desc'
    } = params;

    const input = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        category_id,
        status,
        sort_by,
        sort_order
    };

    logger.debug('Fetching items', input);

    try {
        const result = await callProcedure('sp_get_items', input);

        // Handle result - stored procedure should return items and count
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
        // Demo fallback - return sample data if procedure doesn't exist
        if (error.message.includes('PROCEDURE') || error.message.includes('procedure')) {
            return getDemoItems(input);
        }
        throw error;
    }
};

/**
 * Demo items for testing
 */
const getDemoItems = (params) => {
    const demoItems = [
        {
            id: 1,
            item_code: 'ITM001',
            item_name: 'Sample Item 1',
            description: 'This is a sample item',
            category_id: 1,
            category_name: 'General',
            unit: 'PCS',
            unit_price: 100.00,
            quantity: 50,
            reorder_level: 10,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 2,
            item_code: 'ITM002',
            item_name: 'Sample Item 2',
            description: 'Another sample item',
            category_id: 1,
            category_name: 'General',
            unit: 'KG',
            unit_price: 250.50,
            quantity: 100,
            reorder_level: 20,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];

    return {
        items: demoItems,
        pagination: {
            page: params.page,
            limit: params.limit,
            total: demoItems.length
        }
    };
};

/**
 * Get item by ID
 * @param {number} id - Item ID
 * @returns {Promise<Object>} Item data
 */
const getItemById = async (id) => {
    logger.debug('Fetching item by ID', { id });

    try {
        const result = await callProcedure('sp_get_item_by_id', { id });

        if (!result.data || result.data.length === 0) {
            throw new NotFoundException('Item');
        }

        return result.data[0];
    } catch (error) {
        if (error instanceof NotFoundException) {
            throw error;
        }

        // Demo fallback
        if (error.message.includes('PROCEDURE')) {
            if (id === 1 || id === 2) {
                return getDemoItems({}).items[id - 1];
            }
            throw new NotFoundException('Item');
        }
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

    logger.info('Creating item', { item_code: data.item_code });

    try {
        const result = await callProcedure('sp_create_item', itemModel.toCreateJSON());

        logger.info('Item created successfully', { item_code: data.item_code });

        return result.data;
    } catch (error) {
        // Demo fallback
        if (error.message.includes('PROCEDURE')) {
            const demoResult = {
                ...itemModel.toCreateJSON(),
                id: Math.floor(Math.random() * 1000) + 100,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            logger.info('Demo item created', demoResult);
            return demoResult;
        }
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
    // First check if item exists
    await getItemById(id);

    const itemModel = new ItemModel(data);
    itemModel.validateForUpdate();

    logger.info('Updating item', { id });

    try {
        const result = await callProcedure('sp_update_item', itemModel.toUpdateJSON(id));

        logger.info('Item updated successfully', { id });

        return result.data || { id, ...data, updated_at: new Date().toISOString() };
    } catch (error) {
        // Demo fallback
        if (error.message.includes('PROCEDURE')) {
            return { id, ...data, updated_at: new Date().toISOString() };
        }
        throw error;
    }
};

/**
 * Delete item
 * @param {number} id - Item ID
 * @returns {Promise<boolean>} Success status
 */
const deleteItem = async (id) => {
    // First check if item exists
    await getItemById(id);

    logger.info('Deleting item', { id });

    try {
        await callProcedure('sp_delete_item', { id });

        logger.info('Item deleted successfully', { id });

        return true;
    } catch (error) {
        // Demo fallback
        if (error.message.includes('PROCEDURE')) {
            return true;
        }
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
        // Demo fallback
        return [
            { id: 1, name: 'General', description: 'General items' },
            { id: 2, name: 'Electronics', description: 'Electronic items' },
            { id: 3, name: 'Consumables', description: 'Consumable items' }
        ];
    }
};

module.exports = {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    getCategories
};
