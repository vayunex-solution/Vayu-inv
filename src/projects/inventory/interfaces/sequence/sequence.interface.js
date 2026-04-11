/**
 * Sequence Interface (Contract)
 * Defines the method signatures.
 * Implementation resides in the Service layer.
 * @interface
 */
class SequenceInterface {
    /**
     * Retrieve all sequences
     * @param {string} headName - Search term for head name
     * @param {number} start - Pagination start
     * @param {number} end - Pagination end
     * @returns {Promise<Object>}
     */
    getAll(headName, start, end) { }

    /**
     * Retrieve a sequence by Head Name
     * @param {string} headName 
     * @returns {Promise<Object>}
     */
    getByName(headName) { }

    /**
     * Create or Update a sequence
     * @param {number} actionType - 1=Insert, 2=Update
     * @param {Object} data 
     * @returns {Promise<Object>}
     */
    upsert(actionType, data) { }

    /**
     * Delete a sequence
     * @param {string} headName 
     * @returns {Promise<Object>}
     */
    delete(headName) { }
}

module.exports = SequenceInterface;
