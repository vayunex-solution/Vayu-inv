/**
 * State Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class StateInterface {
    /**
     * Retrieve all states
     * @returns {Promise<Array>}
     */
    getAll() { }

    /**
     * Retrieve state dropdown list
     * @returns {Promise<Object>}
     */
    getDropdown() { }

    /**
     * Retrieve a state by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Create a new state
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create(data) { }

    /**
     * Update an existing state
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update(id, data) { }

    /**
     * Delete a state
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    delete(id) { }
}

module.exports = StateInterface;
