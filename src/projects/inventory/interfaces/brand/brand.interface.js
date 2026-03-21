/**
 * Brand Master Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class BrandInterface {
    /**
     * Retrieve a brand by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Retrieve all brands
     * @returns {Promise<Object>}
     */
    getAll() { }

    /**
     * Retrieve brand dropdown list
     * @returns {Promise<Object>}
     */
    getDropdown() { }

    /**
     * Create a new brand
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create(data) { }

    /**
     * Update an existing brand
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update(id, data) { }

    /**
     * Delete a brand (Soft)
     * @param {number} id 
     * @param {string} updatedBy
     * @returns {Promise<Object>}
     */
    delete(id, updatedBy) { }
}

module.exports = BrandInterface;
