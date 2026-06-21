/**
 * Customer Master Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class CustomerInterface {
    /**
     * Retrieve a customer by ID
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    getById(id) { }

    /**
     * Retrieve all customers
     * @returns {Promise<Object>}
     */
    getAll() { }

    /**
     * Retrieve customer dropdown list
     * @returns {Promise<Object>}
     */
    getDropdown() { }

    /**
     * Create a new customer
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    create(data) { }

    /**
     * Update an existing customer
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    update(id, data) { }

    /**
     * Delete a customer (Soft)
     * @param {number} id 
     * @param {number} deletedBy
     * @returns {Promise<Object>}
     */
    delete(id, deletedBy) { }
}

module.exports = CustomerInterface;
