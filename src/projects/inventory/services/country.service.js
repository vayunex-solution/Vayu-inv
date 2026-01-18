const CountryInterface = require("../interfaces/country.interface");
const { Country, CountryModel } = require("../models/country.model");
const { callProcedureMultiParam } = require("../../../core/database");

class CountryService extends CountryInterface {
    getAll() { return Country.findAll(); }
    getById(id) { return Country.findByPk(id); }

    async create(data) {
        const model = new CountryModel({
            countryName: data.country_name,
            countryCode: data.country_code,
            isStatus: data.is_status,
            createdBy: data.created_by
        });

        const result = await callProcedureMultiParam('usp_country_insupd', [
            1, // Insert
            model.toSpParams(1)
        ]);
        return result.data;
    }

    async update(id, data) {
        const model = new CountryModel({
            countryId: id,
            countryName: data.country_name,
            countryCode: data.country_code,
            isStatus: data.is_status,
            modifyBy: data.modify_by
        });

        const result = await callProcedureMultiParam('usp_country_insupd', [
            2, // Update
            model.toSpParams(2)
        ]);
        return result.data;
    }

    async delete(id) {
        const model = new CountryModel({ countryId: id });
        // Minimal data needed for delete
        const result = await callProcedureMultiParam('usp_country_insupd', [
            3, // Delete
            model.toSpParams(3)
        ]);
        return result.data;
    }
}
module.exports = new CountryService();
