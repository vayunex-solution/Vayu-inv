const FYInterface = require("../../interfaces/fy/fy.interface");
const { FYModel } = require("../../models/fy/fy.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class FYService extends FYInterface {
    /**
     * Get all financial years
     * Uses usp_fy_list with ActionType = 2
     */
    async getAll() {
        // p_ActionType = 2 (List + Count + Filters)
        // p_FYID = 0 (Ignored for List)
        const result = await callProcedureMultiParam('usp_fy_list', [2, 0]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get financial year dropdown
     * Uses usp_fy_list with ActionType = 3
     */
    async getDropdown() {
        // p_ActionType = 3 (Dropdown)
        const result = await callProcedureMultiParam('usp_fy_list', [3, 0]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get financial year by ID
     * Uses usp_fy_list with ActionType = 1
     * @param {number} id
     */
    async getById(id) {
        // p_ActionType = 1 (Detail)
        const result = await callProcedureMultiParam('usp_fy_list', [1, id]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            if (!parsed.data) {
                return { success: false, message: "Financial Year not found" };
            }
            return parsed;
        }
        return { success: false, message: "Financial Year not found" };
    }

    /**
     * Create Financial Year
     * @param {Object} data 
     */
    async create(data) {
        const model = new FYModel({
            fyName: data.fy_name,
            fyStDate: data.fy_st_date,
            fyEndDate: data.fy_end_date,
            isCurrentFy: data.is_current_fy
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 1 (Insert)
        const result = await callProcedureMultiParam('usp_fy_insupd', [1, payload]);

        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Update Financial Year
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new FYModel({
            fyId: id,
            fyName: data.fy_name,
            fyStDate: data.fy_st_date,
            fyEndDate: data.fy_end_date,
            isCurrentFy: data.is_current_fy
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 2 (Update)
        const result = await callProcedureMultiParam('usp_fy_insupd', [2, payload]);
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Delete Financial Year
     * @param {number} id 
     */
    async delete(id) {
        const model = new FYModel({ fyId: id });
        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 3 (Delete)
        const result = await callProcedureMultiParam('usp_fy_insupd', [3, payload]);
        return result && result.length > 0 ? result[0] : result;
    }
}

module.exports = new FYService();
