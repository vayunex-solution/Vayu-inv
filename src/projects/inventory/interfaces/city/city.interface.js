/**
 * City Interface
 * Defines the contract for City Service
 */
class CityInterface {
    async getAll(stateId) { throw new Error("Method 'getAll()' must be implemented."); }
    async getDropdown(stateId) { throw new Error("Method 'getDropdown()' must be implemented."); }
    async getById(id) { throw new Error("Method 'getById()' must be implemented."); }
    async create(data) { throw new Error("Method 'create()' must be implemented."); }
    async update(id, data) { throw new Error("Method 'update()' must be implemented."); }
    async delete(id, updatedBy) { throw new Error("Method 'delete()' must be implemented."); }
}

module.exports = CityInterface;
