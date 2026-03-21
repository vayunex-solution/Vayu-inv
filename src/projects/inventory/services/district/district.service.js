const DistrictInterface = require("../../interfaces/district/district.interface");
const { DistrictModel } = require("../../models/district/district.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class DistrictService extends DistrictInterface {
    /**
     * Get district by ID
     * Uses usp_district_list with ActionType = 1
     * @param {number} id
     */
    async getById(id) {
        // p_ActionType = 1 (Detail)
        // p_DistrictId = id
        // p_StateId = 0 (Ignored for Detail)
        const result = await callProcedureMultiParam('usp_district_list', [1, id, 0]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            if (!parsed.data) {
                return { success: false, message: "District not found" };
            }
            return parsed;
        }
        return { success: false, message: "District not found" };
    }

    /**
     * Get all districts
     * Uses usp_district_list with ActionType = 2
     * @param {number} stateId 
     */
    async getAll(stateId = 0) {
        // p_ActionType = 2 (List + Count)
        // p_DistrictId = 0
        // p_StateId = stateId
        const result = await callProcedureMultiParam('usp_district_list', [2, 0, stateId]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get district dropdown
     * Uses usp_district_list with ActionType = 3
     * @param {number} stateId
     */
    async getDropdown(stateId = 0) {
        // p_ActionType = 3 (Dropdown)
        const result = await callProcedureMultiParam('usp_district_list', [3, 0, stateId]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Create District
     * @param {Object} data 
     */
    async create(data) {
        const model = new DistrictModel({
            districtName: data.district_name,
            stateId: data.state_id,
            countryId: data.country_id,
            isActive: data.is_active,
            createdBy: data.created_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 1 (Insert)
        const result = await callProcedureMultiParam('usp_district_insupd', [1, payload]);

        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Update District
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new DistrictModel({
            districtId: id,
            districtName: data.district_name,
            stateId: data.state_id,
            countryId: data.country_id,
            isActive: data.is_active,
            updatedBy: data.updated_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 2 (Update)
        const result = await callProcedureMultiParam('usp_district_insupd', [2, payload]);
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Delete District (Soft)
     * @param {number} id 
     * @param {string} updatedBy
     */
    async delete(id, updatedBy) {
        const model = new DistrictModel({ districtId: id, updatedBy: updatedBy });
        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 3 (Delete - Soft)
        const result = await callProcedureMultiParam('usp_district_insupd', [3, payload]);
        return result && result.length > 0 ? result[0] : result;
    }
}

module.exports = new DistrictService();
