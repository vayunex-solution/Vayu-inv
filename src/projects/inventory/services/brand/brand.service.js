const BrandInterface = require("../../interfaces/brand/brand.interface");
const { BrandModel } = require("../../models/brand/brand.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class BrandService extends BrandInterface {
    /**
     * Get brand by ID
     * @param {number} id 
     */
    async getById(id) {
        // p_ActionType = 1 (Detail)
        // p_BrandId = id
        const result = await callProcedureMultiParam('usp_brand_list', [1, id]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            if (!parsed.data) {
                return { success: false, message: "Brand not found" };
            }
            return parsed;
        }
        return { success: false, message: "Brand not found" };
    }

    /**
     * Get all brands
     */
    async getAll() {
        // p_ActionType = 2 (List + Count + Filters)
        // p_BrandId = 0
        const result = await callProcedureMultiParam('usp_brand_list', [2, 0]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get brand dropdown
     */
    async getDropdown() {
        // p_ActionType = 3 (Dropdown)
        const result = await callProcedureMultiParam('usp_brand_list', [3, 0]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Create Brand
     * @param {Object} data 
     */
    async create(data) {
        const model = new BrandModel({
            brandName: data.brand_name,
            shortName: data.short_name,
            isActive: data.is_active,
            createdBy: data.created_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 1 (Insert)
        const result = await callProcedureMultiParam('usp_brand_insupd', [1, payload]);

        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Update Brand
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new BrandModel({
            brandId: id,
            brandName: data.brand_name,
            shortName: data.short_name,
            isActive: data.is_active,
            updatedBy: data.updated_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 2 (Update)
        const result = await callProcedureMultiParam('usp_brand_insupd', [2, payload]);
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Delete Brand (Soft)
     * @param {number} id 
     * @param {string} updatedBy
     */
    async delete(id, updatedBy) {
        const model = new BrandModel({ brandId: id, updatedBy: updatedBy });
        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 3 (Delete - Soft)
        const result = await callProcedureMultiParam('usp_brand_insupd', [3, payload]);
        return result && result.length > 0 ? result[0] : result;
    }
}

module.exports = new BrandService();
