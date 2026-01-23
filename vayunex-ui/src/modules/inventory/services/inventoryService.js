// src/modules/inventory/services/inventoryService.js
// Inventory related service functions

import itemsData from '../../../data/items.json';
import categoriesData from '../../../data/categories.json';

/**
 * Get all items with optional filtering
 * @param {object} params - Search and filter parameters
 * @returns {Promise<{success: boolean, data: array}>}
 */
export const getItems = async (params = {}) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    let items = [...itemsData];

    // Add category name to each item
    items = items.map(item => ({
        ...item,
        category_name: categoriesData.find(c => c.id === item.category_id)?.name || 'Uncategorized'
    }));

    // Apply search filter
    if (params.search) {
        const searchLower = params.search.toLowerCase();
        items = items.filter(item =>
            item.item_name.toLowerCase().includes(searchLower) ||
            item.item_code.toLowerCase().includes(searchLower)
        );
    }

    // Apply category filter
    if (params.category_id) {
        items = items.filter(item => item.category_id === params.category_id);
    }

    return { success: true, data: items };
};

/**
 * Get single item by ID
 * @param {number} id 
 * @returns {Promise<{success: boolean, data?: object, error?: object}>}
 */
export const getItemById = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    const item = itemsData.find(i => i.id === id);

    if (item) {
        return {
            success: true,
            data: {
                ...item,
                category_name: categoriesData.find(c => c.id === item.category_id)?.name || 'Uncategorized'
            }
        };
    }

    return {
        success: false,
        error: { message: 'Item not found' }
    };
};

/**
 * Create new item
 * @param {object} itemData 
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const createItem = async (itemData) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newItem = {
        id: Date.now(),
        ...itemData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    return { success: true, data: newItem };
};

/**
 * Update existing item
 * @param {number} id 
 * @param {object} itemData 
 * @returns {Promise<{success: boolean, data: object}>}
 */
export const updateItem = async (id, itemData) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
        success: true,
        data: { id, ...itemData, updated_at: new Date().toISOString() }
    };
};

/**
 * Delete item
 * @param {number} id 
 * @returns {Promise<{success: boolean}>}
 */
export const deleteItem = async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { success: true };
};
