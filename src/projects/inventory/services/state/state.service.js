const StateInterface = require("../../interfaces/state/state.interface");
const { State, StateModel } = require("../../models/state/state.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class StateService extends StateInterface {
    /**
     * Get all states
     * Uses usp_state_list with ActionType = 2
     */
    async getAll(countryId = 0) {
        // p_ActionType = 2 (List + Count + Filters)
        // p_StateId = 0 (Ignored for List)
        // p_CountryId = countryId
        const result = await callProcedureMultiParam('usp_state_list', [
            2,
            0,
            countryId
        ]);

        // SP returns a single row with a 'response' column containing JSON string
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get state dropdown
     * Uses usp_state_list with ActionType = 3
     */
    async getDropdown(countryId = 0) {
        // p_ActionType = 3 (Dropdown)
        // p_StateId = 0
        // p_CountryId = countryId
        const result = await callProcedureMultiParam('usp_state_list', [
            3,
            0,
            countryId
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get state by ID
     * Uses usp_state_list with ActionType = 1
     * @param {number} id
     */
    async getById(id) {
        // p_ActionType = 1 (Detail)
        // p_StateId = id
        // p_CountryId = 0 (Ignored for Detail)
        const result = await callProcedureMultiParam('usp_state_list', [
            1,
            id,
            0
        ]);

        // SP returns a single row with a 'response' column containing JSON string
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            // Check if data field is null (state not found)
            if (!parsed.data) {
                return { success: false, message: "State not found" };
            }
            return parsed;
        }
        return { success: false, message: "State not found" };
    }

    /**
     * Create State using JSON SP
     * @param {Object} data 
     */
    async create(data) {
        const model = new StateModel({
            countryId: data.country_id,
            stateName: data.state_name,
            stateCode: data.state_code,
            gstStateCode: data.gst_state_code,
            isStatus: data.is_status,
            createdBy: data.created_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 1 (Insert)
        // p_JsonData = Stringified JSON
        const result = await callProcedureMultiParam('usp_state_insupd', [
            1,
            payload
        ]);

        // Return first row of result set for feedback (Message, etc.)
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Update State using JSON SP
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new StateModel({
            stateId: id,
            countryId: data.country_id,
            stateName: data.state_name,
            stateCode: data.state_code,
            gstStateCode: data.gst_state_code,
            isStatus: data.is_status,
            modifyBy: data.modify_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 2 (Update)
        const result = await callProcedureMultiParam('usp_state_insupd', [
            2,
            payload
        ]);
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Delete State using JSON SP
     * @param {number} id 
     */
    async delete(id) {
        // Minimal data needed: StateId
        const model = new StateModel({ stateId: id });
        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 3 (Delete)
        const result = await callProcedureMultiParam('usp_state_insupd', [
            3,
            payload
        ]);
        return result && result.length > 0 ? result[0] : result;
    }
}

module.exports = new StateService();
