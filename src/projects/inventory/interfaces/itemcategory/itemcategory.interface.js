/**
 * Item Category Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class ItemCategoryInterface {
    /**
     * Retrieve all item categories
     * @returns {Promise<Object>}
     */
    getAll() { }

    /**
     * Retrieve item category dropdown list
     * @returns {Promise<Object>}
     */
    getDropdown() { }

    /**
     * Retrieve an item category by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Create a new item category
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create(data) { }

    /**
     * Update an existing item category
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update(id, data) { }

    /**
     * Delete an item category
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    delete(id) { }
}

module.exports = ItemCategoryInterface;
