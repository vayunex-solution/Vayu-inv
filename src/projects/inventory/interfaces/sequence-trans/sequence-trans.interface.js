/**
 * Sequence Trans Interface (Contract)
 * Defines the method signatures for transaction sequence management.
 * Implementation resides in the Service layer.
 * @interface
 */
class SequenceTransInterface {
    /**
     * Retrieve all transaction sequences
     * @returns {Promise<Object>}
     */
    getAll() { }

    /**
     * Retrieve a transaction sequence by Head Name and Financial Year
     * @param {string} headName 
     * @param {string} financialYear 
     * @returns {Promise<Object>}
     */
    getByNameAndFY(headName, financialYear) { }

    /**
     * Create or Update a transaction sequence
     * @param {number} actionType - 1=Insert, 2=Update
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    upsert(actionType, data) { }

    /**
     * Delete a transaction sequence
     * @param {string} headName 
     * @param {string} financialYear 
     * @returns {Promise<Object>}
     */
    delete(headName, financialYear) { }
}

module.exports = SequenceTransInterface;
