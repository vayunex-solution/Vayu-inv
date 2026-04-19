const AccountInterface = require("../../interfaces/account/account.interface");
const { AccountGroupModel } = require("../../models/account/account-group.model");
const { AccountHeadModel } = require("../../models/account/account-head.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class AccountService extends AccountInterface {
    // --- Account Group Implementation ---

    async getGroupById(id) {
        const result = await callProcedureMultiParam('usp_accountgroups_list', [1, id]);
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            if (!parsed.data) return { success: false, message: "Account Group not found" };
            return parsed;
        }
        return { success: false, message: "Account Group not found" };
    }

    async getAllGroups() {
        const result = await callProcedureMultiParam('usp_accountgroups_list', [2, 0]);
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    async getGroupsDropdown() {
        const result = await callProcedureMultiParam('usp_accountgroups_list', [3, 0]);
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    async createGroup(data) {
        const model = new AccountGroupModel(data);
        const payload = JSON.stringify(model.toJsonForSp());
        const result = await callProcedureMultiParam('usp_accountgroups_insupd', [1, payload]);
        return result.data && result.data.length > 0 ? result.data[0] : result;
    }

    async updateGroup(id, data) {
        data.GroupId = id;
        const model = new AccountGroupModel(data);
        const payload = JSON.stringify(model.toJsonForSp());
        const result = await callProcedureMultiParam('usp_accountgroups_insupd', [2, payload]);
        return result.data && result.data.length > 0 ? result.data[0] : result;
    }

    async deleteGroup(id) {
        const model = new AccountGroupModel({ GroupId: id });
        const payload = JSON.stringify(model.toJsonForSp());
        const result = await callProcedureMultiParam('usp_accountgroups_insupd', [3, payload]);
        return result.data && result.data.length > 0 ? result.data[0] : result;
    }

    // --- Account Head Implementation ---

    async getHeadById(id) {
        const result = await callProcedureMultiParam('usp_accounthead_list', [1, id]);
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            if (!parsed.data) return { success: false, message: "Account Head not found" };
            return parsed;
        }
        return { success: false, message: "Account Head not found" };
    }

    async getAllHeads() {
        const result = await callProcedureMultiParam('usp_accounthead_list', [2, 0]);
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    async getHeadsDropdown() {
        const result = await callProcedureMultiParam('usp_accounthead_list', [3, 0]);
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    async createHead(data) {
        const model = new AccountHeadModel(data);
        const payload = JSON.stringify(model.toJsonForSp());
        const result = await callProcedureMultiParam('usp_accounthead_insupd', [1, payload]);
        return result.data && result.data.length > 0 ? result.data[0] : result;
    }

    async updateHead(id, data) {
        data.accountid = id;
        const model = new AccountHeadModel(data);
        const payload = JSON.stringify(model.toJsonForSp());
        const result = await callProcedureMultiParam('usp_accounthead_insupd', [2, payload]);
        return result.data && result.data.length > 0 ? result.data[0] : result;
    }

    async deleteHead(id) {
        const model = new AccountHeadModel({ accountid: id });
        const payload = JSON.stringify(model.toJsonForSp());
        const result = await callProcedureMultiParam('usp_accounthead_insupd', [3, payload]);
        return result.data && result.data.length > 0 ? result.data[0] : result;
    }
}

module.exports = new AccountService();
