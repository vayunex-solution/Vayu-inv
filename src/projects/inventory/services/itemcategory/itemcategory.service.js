const ItemCategoryInterface = require("../../interfaces/itemcategory/itemcategory.interface");
const { ItemCategory, ItemCategoryModel } = require("../../models/itemcategory/itemcategory.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class ItemCategoryService extends ItemCategoryInterface {
    /**
     * Get all item categories
     * Uses usp_itemcategory_list with ActionType = 2
     */
    async getAll() {
        const result = await callProcedureMultiParam('usp_itemcategory_list', [
            2, // ActionType: List
            0  // CategoryId: Ignored
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get item category dropdown
     * Uses usp_itemcategory_list with ActionType = 3
     */
    async getDropdown() {
        const result = await callProcedureMultiParam('usp_itemcategory_list', [
            3, // ActionType: Dropdown
            0  // CategoryId: Ignored
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get item category by ID
     * Uses usp_itemcategory_list with ActionType = 1
     * @param {number} id
     */
    async getById(id) {
        const result = await callProcedureMultiParam('usp_itemcategory_list', [
            1, // ActionType: Detail
            id
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            if (!parsed.data) {
                return { success: false, message: "Item Category not found" };
            }
            return parsed;
        }
        return { success: false, message: "Item Category not found" };
    }

    /**
     * Create Item Category using JSON SP
     * @param {Object} data 
     */
    async create(data) {
        const model = new ItemCategoryModel({
            categoryName: data.category_name,
            parentId: data.parent_id,
            isActive: data.is_active || 'Y',
            createdBy: data.created_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        const result = await callProcedureMultiParam('usp_itemcategory_insupd', [
            1, // ActionType: Insert
            payload
        ]);

        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }

    /**
     * Update Item Category using JSON SP
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new ItemCategoryModel({
            categoryId: id,
            categoryName: data.category_name,
            parentId: data.parent_id,
            isActive: data.is_active,
            updatedBy: data.updated_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        const result = await callProcedureMultiParam('usp_itemcategory_insupd', [
            2, // ActionType: Update
            payload
        ]);

        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }

    /**
     * Delete Item Category using JSON SP (Soft Delete)
     * @param {number} id 
     */
    async delete(id) {
        const model = new ItemCategoryModel({ categoryId: id });
        const payload = JSON.stringify(model.toJsonForSp());

        const result = await callProcedureMultiParam('usp_itemcategory_insupd', [
            3, // ActionType: Delete
            payload
        ]);

        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }
}

module.exports = new ItemCategoryService();
