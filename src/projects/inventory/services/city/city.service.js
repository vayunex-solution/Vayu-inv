const CityInterface = require("../../interfaces/city/city.interface");
const { City, CityModel } = require("../../models/city/city.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class CityService extends CityInterface {
    /**
     * Get all cities
     * Uses usp_city_list with ActionType = 2
     */
    async getAll(stateId = 0) {
        // p_ActionType = 2 (List + Count)
        // p_CityId = 0
        // p_StateId = stateId
        const result = await callProcedureMultiParam('usp_city_list', [
            2,
            0,
            stateId
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get city dropdown
     * Uses usp_city_list with ActionType = 3
     */
    async getDropdown(stateId = 0) {
        // p_ActionType = 3 (Dropdown)
        // p_CityId = 0
        // p_StateId = stateId
        const result = await callProcedureMultiParam('usp_city_list', [
            3,
            0,
            stateId
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get city by ID
     * Uses usp_city_list with ActionType = 1
     * @param {number} id
     */
    async getById(id) {
        // p_ActionType = 1 (Detail)
        // p_CityId = id
        // p_StateId = 0
        const result = await callProcedureMultiParam('usp_city_list', [
            1,
            id,
            0
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            if (!parsed.data) {
                return { success: false, message: "City not found" };
            }
            return parsed;
        }
        return { success: false, message: "City not found" };
    }

    /**
     * Create City using JSON SP
     * @param {Object} data 
     */
    async create(data) {
        const model = new CityModel({
            cityName: data.city_name,
            districtId: data.district_id,
            stateId: data.state_id,
            countryId: data.country_id,
            pincode: data.pincode,
            isActive: data.is_active || 'Y',
            createdBy: data.created_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 1 (Insert)
        const result = await callProcedureMultiParam('usp_city_insupd', [
            1,
            payload
        ]);

        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }

    /**
     * Update City using JSON SP
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new CityModel({
            cityId: id,
            cityName: data.city_name,
            districtId: data.district_id,
            stateId: data.state_id,
            countryId: data.country_id,
            pincode: data.pincode,
            isActive: data.is_active,
            updatedBy: data.updated_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 2 (Update)
        const result = await callProcedureMultiParam('usp_city_insupd', [
            2,
            payload
        ]);
        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }

    /**
     * Delete City using JSON SP (Soft Delete)
     * @param {number} id 
     * @param {string} updatedBy
     */
    async delete(id, updatedBy) {
        const model = new CityModel({ cityId: id, updatedBy: updatedBy });
        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 3 (Delete)
        const result = await callProcedureMultiParam('usp_city_insupd', [
            3,
            payload
        ]);
        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }
}

module.exports = new CityService();
