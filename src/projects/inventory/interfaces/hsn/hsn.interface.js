/**
 * HSN Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class HSNInterface {
    /**
     * Retrieve all HSNs
     * @returns {Promise<Object>}
     */
    getAll() { }

    /**
     * Retrieve HSN dropdown list
     * @returns {Promise<Object>}
     */
    getDropdown() { }

    /**
     * Retrieve an HSN by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Create a new HSN
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create(data) { }

    /**
     * Update an existing HSN
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update(id, data) { }

    /**
     * Delete an HSN
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    delete(id) { }
}

module.exports = HSNInterface;
