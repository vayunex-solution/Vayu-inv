const HSNInterface = require("../../interfaces/hsn/hsn.interface");
const { HSN, HSNModel } = require("../../models/hsn/hsn.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class HSNService extends HSNInterface {
    /**
     * Get all HSNs
     * Uses usp_gst_hsn_list with ActionType = 2
     */
    async getAll() {
        const result = await callProcedureMultiParam('usp_gst_hsn_list', [
            2, // ActionType: List
            0  // GSTHSNID: Ignored
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get HSN dropdown
     * Uses usp_gst_hsn_list with ActionType = 3
     */
    async getDropdown() {
        const result = await callProcedureMultiParam('usp_gst_hsn_list', [
            3, // ActionType: Dropdown
            0  // GSTHSNID: Ignored
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get HSN by ID
     * Uses usp_gst_hsn_list with ActionType = 1
     * @param {number} id
     */
    async getById(id) {
        const result = await callProcedureMultiParam('usp_gst_hsn_list', [
            1, // ActionType: Detail
            id
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            if (!parsed.data) {
                return { success: false, message: "HSN not found" };
            }
            return parsed;
        }
        return { success: false, message: "HSN not found" };
    }

    /**
     * Create HSN using JSON SP
     * @param {Object} data 
     */
    async create(data) {
        const model = new HSNModel({
            hsnCode: data.hsn_code,
            hsnDesc: data.hsn_desc,
            gstRate: data.gst_rate,
            cgst: data.cgst,
            sgst: data.sgst,
            igst: data.igst,
            cess: data.cess,
            wefDate: data.wef_date,
            wefToDate: data.wef_todate,
            isActive: data.is_active || 'Y',
            createdBy: data.created_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        const result = await callProcedureMultiParam('usp_gst_hsn_insupd', [
            1, // ActionType: Insert
            payload
        ]);

        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }

    /**
     * Update HSN using JSON SP
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new HSNModel({
            gstHsnId: id,
            hsnCode: data.hsn_code,
            hsnDesc: data.hsn_desc,
            gstRate: data.gst_rate,
            cgst: data.cgst,
            sgst: data.sgst,
            igst: data.igst,
            cess: data.cess,
            wefDate: data.wef_date,
            wefToDate: data.wef_todate,
            isActive: data.is_active,
            updatedBy: data.updated_by
        });

        const payload = JSON.stringify(model.toJsonForSp());

        const result = await callProcedureMultiParam('usp_gst_hsn_insupd', [
            2, // ActionType: Update
            payload
        ]);

        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }

    /**
     * Delete HSN using JSON SP (Soft Delete)
     * @param {number} id 
     */
    async delete(id) {
        const model = new HSNModel({ gstHsnId: id });
        const payload = JSON.stringify(model.toJsonForSp());

        const result = await callProcedureMultiParam('usp_gst_hsn_insupd', [
            3, // ActionType: Delete
            payload
        ]);

        return result && result.data && result.data.length > 0 ? result.data[0] : result;
    }
}

module.exports = new HSNService();
