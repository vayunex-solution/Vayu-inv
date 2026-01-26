/**
 * Menu Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class MenuInterface {
    /**
     * Retrieve all menus
     * @returns {Promise<Array>}
     */
    getAll() { }

    /**
     * Retrieve menu dropdown list
     * @returns {Promise<Object>}
     */
    getDropdown() { }

    /**
     * Retrieve menu tree structure
     * @returns {Promise<Array>}
     */
    getTreeList() { }

    /**
     * Retrieve a menu by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Create a new menu
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create(data) { }

    /**
     * Update an existing menu
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update(id, data) { }

    /**
     * Delete a menu (soft delete - deactivate)
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    delete(id) { }
}

module.exports = MenuInterface;
