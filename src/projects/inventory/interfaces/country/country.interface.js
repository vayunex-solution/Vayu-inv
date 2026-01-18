/**
 * Country Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class CountryInterface {
    /**
     * Retrieve all countries
     * @returns {Promise<Array>}
     */
    getAll() { }

    /**
     * Retrieve country dropdown list
     * @returns {Promise<Object>}
     */
    getDropdown() { }

    /**
     * Retrieve a country by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Create a new country
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create(data) { }

    /**
     * Update an existing country
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update(id, data) { }

    /**
     * Delete a country
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    delete(id) { }
}

module.exports = CountryInterface;
