/**
 * Country Service
 * Business logic for country management
 */
const { callProcedureMultiParam } = require('../../../../core/database');
const logger = require('../../../../core/logger');
const { CountryModel } = require('../../models/country/country.model');

/**
 * Create new country
 * @param {Object} data - Country data
 * @param {Object} user - User performing the action
 * @returns {Promise<Object>} Created country result
 */
const createCountry = async (data, user) => {
    logger.info('Creating country', { country_code: data.country_code });

    const model = new CountryModel(data);
    model.validateForCreate();

    const jsonData = model.toProcedureParams(user.id, false);

    // ActionType 1: Insert
    const result = await callProcedureMultiParam('usp_country_insupd', [
        1, // p_ActionType
        jsonData // p_JsonData
    ]);

    return result.data;
};

/**
 * Update country
 * @param {number} id - Country ID
 * @param {Object} data - Country data
 * @param {Object} user - User performing the action
 * @returns {Promise<Object>} Updated country result
 */
const updateCountry = async (id, data, user) => {
    logger.info('Updating country', { id });

    // Validate update data
    const tempModel = new CountryModel();
    tempModel.validateForUpdate(data);

    // Prepare complete data for SP (merging with ID and defaults if needed, 
    // though SP usually handles partial updates or we send full object. 
    // Assuming we send what we have plus the ID)

    // For the SP wrapper, we often construct the object.
    // The previous implementation constructed a full object.
    // Let's assume we map the incoming fields to the model parameters.
    const modelData = {
        country_id: id,
        ...data
    };

    const model = new CountryModel(modelData);
    const jsonData = model.toProcedureParams(user.id, true);

    // ActionType 2: Update
    const result = await callProcedureMultiParam('usp_country_insupd', [
        2, // p_ActionType
        jsonData // p_JsonData
    ]);

    return result.data;
};

/**
 * Delete country
 * @param {number} id - Country ID
 * @param {Object} user - User performing the action
 * @returns {Promise<Object>} Deletion result
 */
const deleteCountry = async (id, user) => {
    logger.info('Deleting country', { id });

    const jsonData = {
        Country_Id: parseInt(id, 10),
        ModifyBy: user.id
    };

    // ActionType 3: Delete
    const result = await callProcedureMultiParam('usp_country_insupd', [
        3, // p_ActionType
        jsonData // p_JsonData
    ]);

    return result.data;
};

module.exports = {
    createCountry,
    updateCountry,
    deleteCountry
};
