/**
 * Items Master Interface (Contract)
 * Defines the method signatures for item management.
 * Implementation resides in the Service layer.
 * @interface
 */
class ItemInterface {
    /**
     * Retrieve all items
     * @returns {Promise<Object>}
     */
    getAll() { }

    /**
     * Retrieve an item by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Retrieve active items for dropdown
     * @returns {Promise<Object>}
     */
    getDropdown() { }

    /**
     * Create or Update an item
     * @param {number} actionType - 1=Insert, 2=Update
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    upsert(actionType, data) { }

    /**
     * Delete an item
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    delete(id) { }
}

module.exports = ItemInterface;
