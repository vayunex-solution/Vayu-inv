const CountryInterface = require("../../interfaces/country/country.interface");
const { Country, CountryModel } = require("../../models/country/country.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class CountryService extends CountryInterface {
    /**
     * Get all countries
     * Strategy: Use Sequelize model for read operations if simple SELECT.
     * Alternatively, if an SP exists for listing, use that. 
     * Using Sequelize FindAll for now as per previous implementation logic.
    */
    /**
     * Get all countries
     * Uses usp_country_list with ActionType = 2
     */
    async getAll() {
        // p_ActionType = 2 (List + Count + Filters)
        // p_CountryId = 0 (Ignored for List)
        const result = await callProcedureMultiParam('usp_country_list', [
            2,
            0
        ]);

        // SP returns a single row with a 'response' column containing JSON string
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get country dropdown
     * Uses usp_country_list with ActionType = 3
     */
    async getDropdown() {
        // p_ActionType = 3 (Dropdown)
        // p_CountryId = 0
        const result = await callProcedureMultiParam('usp_country_list', [
            3,
            0
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get country by ID
     * Uses usp_country_list with ActionType = 1
     * @param {number} id
     */
    async getById(id) {
        // p_ActionType = 1 (Detail)
        // p_CountryId = id
        const result = await callProcedureMultiParam('usp_country_list', [
            1,
            id
        ]);

        // SP returns a single row with a 'response' column containing JSON string
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "Country not found" };
    }

    /**
     * Create Country using JSON SP
     * @param {Object} data 
     */
    async create(data) {
        const model = new CountryModel({
            countryName: data.country_name,
            countryCode: data.country_code,
            isStatus: data.is_status,
            createdBy: data.created_by
        });

        const payload = model.toJsonForSp();

        // p_ActionType = 1 (Insert)
        // p_JsonData = Stringified JSON
        const result = await callProcedureMultiParam('usp_country_insupd', [
            1,
            payload
        ]);

        // Return first row of result set for feedback (Message, etc.)
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Update Country using JSON SP
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new CountryModel({
            countryId: id,
            countryName: data.country_name,
            countryCode: data.country_code,
            isStatus: data.is_status,
            modifyBy: data.modify_by
        });

        const payload = model.toJsonForSp();

        // p_ActionType = 2 (Update)
        const result = await callProcedureMultiParam('usp_country_insupd', [
            2,
            payload
        ]);
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Delete Country using JSON SP
     * @param {number} id 
     */
    async delete(id) {
        // Minimal data needed: CountryId
        const model = new CountryModel({ countryId: id });
        const payload = model.toJsonForSp(); // Will set Country_Id, others null/default

        // p_ActionType = 3 (Delete)
        const result = await callProcedureMultiParam('usp_country_insupd', [
            3,
            payload
        ]);
        return result && result.length > 0 ? result[0] : result;
    }
}

module.exports = new CountryService();
