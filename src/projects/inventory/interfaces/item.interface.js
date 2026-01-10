/**
 * Item Interface
 * Type definitions and DTOs for item management
 * @typedef {Object} definitions are documented using JSDoc
 */

/**
 * @typedef {Object} Item
 * @property {number} id - Item ID
 * @property {string} item_code - Unique item code
 * @property {string} item_name - Item name
 * @property {string} description - Item description
 * @property {number} category_id - Category ID
 * @property {string} category_name - Category name
 * @property {string} unit - Unit of measurement
 * @property {number} unit_price - Unit price
 * @property {number} quantity - Current quantity
 * @property {number} reorder_level - Reorder level
 * @property {string} status - Item status (active/inactive)
 * @property {Date} created_at - Creation timestamp
 * @property {Date} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} CreateItemRequest
 * @property {string} item_code - Unique item code
 * @property {string} item_name - Item name
 * @property {string} [description] - Item description
 * @property {number} category_id - Category ID
 * @property {string} unit - Unit of measurement
 * @property {number} unit_price - Unit price
 * @property {number} [quantity=0] - Initial quantity
 * @property {number} [reorder_level=0] - Reorder level
 */

/**
 * @typedef {Object} UpdateItemRequest
 * @property {string} [item_name] - Item name
 * @property {string} [description] - Item description
 * @property {number} [category_id] - Category ID
 * @property {string} [unit] - Unit of measurement
 * @property {number} [unit_price] - Unit price
 * @property {number} [reorder_level] - Reorder level
 * @property {string} [status] - Item status
 */

/**
 * @typedef {Object} ItemListRequest
 * @property {number} [page=1] - Page number
 * @property {number} [limit=10] - Items per page
 * @property {string} [search] - Search term
 * @property {number} [category_id] - Filter by category
 * @property {string} [status] - Filter by status
 * @property {string} [sort_by] - Sort field
 * @property {string} [sort_order] - Sort order (asc/desc)
 */

/**
 * @typedef {Object} ItemListResponse
 * @property {Item[]} items - List of items
 * @property {Object} pagination - Pagination info
 */

/**
 * Validation schemas
 */
const itemValidation = {
    create: {
        item_code: { required: true, type: 'string', maxLength: 50 },
        item_name: { required: true, type: 'string', maxLength: 200 },
        description: { required: false, type: 'string', maxLength: 500 },
        category_id: { required: true, type: 'number' },
        unit: { required: true, type: 'string', maxLength: 20 },
        unit_price: { required: true, type: 'number', min: 0 }
    },
    update: {
        item_name: { required: false, type: 'string', maxLength: 200 },
        description: { required: false, type: 'string', maxLength: 500 },
        category_id: { required: false, type: 'number' },
        unit: { required: false, type: 'string', maxLength: 20 },
        unit_price: { required: false, type: 'number', min: 0 },
        status: { required: false, type: 'string', enum: ['active', 'inactive'] }
    }
};

module.exports = {
    itemValidation
};
