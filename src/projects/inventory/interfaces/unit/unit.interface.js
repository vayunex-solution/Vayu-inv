/**
 * Units Master Interface (Contract)
 * Defines the method signatures for unit of measurement management.
 * Implementation resides in the Service layer.
 * @interface
 */
class UnitInterface {
    /**
     * Retrieve all units
     * @returns {Promise<Object>}
     */
    getAll() { }

    /**
     * Retrieve a unit by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Retrieve a unit by Name
     * @param {string} name 
     * @returns {Promise<Object>}
     */
    getByName(name) { }

    /**
     * Create or Update a unit
     * @param {number} actionType - 1=Insert, 2=Update
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    upsert(actionType, data) { }

    /**
     * Delete a unit
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    delete(id) { }
}

module.exports = UnitInterface;
