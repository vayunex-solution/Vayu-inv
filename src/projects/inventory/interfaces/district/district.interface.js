/**
 * District Master Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class DistrictInterface {
    /**
     * Retrieve a district by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Retrieve all districts
     * @param {number} stateId Optional filter by state ID
     * @returns {Promise<Object>}
     */
    getAll(stateId) { }

    /**
     * Retrieve district dropdown list
     * @param {number} stateId Optional filter by state ID
     * @returns {Promise<Object>}
     */
    getDropdown(stateId) { }

    /**
     * Create a new district
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create(data) { }

    /**
     * Update an existing district
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update(id, data) { }

    /**
     * Delete a district (Soft)
     * @param {number} id 
     * @param {string} updatedBy
     * @returns {Promise<Object>}
     */
    delete(id, updatedBy) { }
}

module.exports = DistrictInterface;
