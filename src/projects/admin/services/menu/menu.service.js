const MenuInterface = require("../../interfaces/menu/menu.interface");
const { Menu, MenuModel } = require("../../models/menu/menu.model");
const { callProcedureMultiParam } = require("../../../../core/database");

class MenuService extends MenuInterface {
    /**
     * Get all menus
     * Uses usp_app_menus_list with ActionType = 2
     */
    async getAll() {
        // p_ActionType = 2 (List + Count + Filters)
        // p_MenuId = 0 (Ignored for List)
        const result = await callProcedureMultiParam('usp_app_menus_list', [
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
     * Get menu dropdown
     * Uses usp_app_menus_list with ActionType = 3
     */
    async getDropdown() {
        // p_ActionType = 3 (Dropdown)
        // p_MenuId = 0
        const result = await callProcedureMultiParam('usp_app_menus_list', [
            3,
            0
        ]);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return { success: false, message: "No data returned from database" };
    }

    /**
     * Get menu tree list
     * Uses usp_app_menus_tree_list
     */
    async getTreeList() {
        // No parameters required for this SP
        const result = await callProcedureMultiParam('usp_app_menus_tree_list', []);

        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            return JSON.parse(result.data[0].response);
        }
        return [];
    }

    /**
     * Get menu by ID
     * Uses usp_app_menus_list with ActionType = 1
     * @param {number} id
     */
    async getById(id) {
        // p_ActionType = 1 (Detail)
        // p_MenuId = id
        const result = await callProcedureMultiParam('usp_app_menus_list', [
            1,
            id
        ]);

        // SP returns a single row with a 'response' column containing JSON string
        if (result && result.data && result.data.length > 0 && result.data[0].response) {
            const parsed = JSON.parse(result.data[0].response);
            // Check if data field is null (menu not found)
            if (!parsed.data) {
                return { success: false, message: "Menu not found" };
            }
            return parsed;
        }
        return { success: false, message: "Menu not found" };
    }

    /**
     * Create Menu using JSON SP
     * @param {Object} data 
     */
    async create(data) {
        const model = new MenuModel({
            menuKey: data.menu_key,
            title: data.title,
            icon: data.icon,
            url: data.url,
            parentId: data.parent_id,
            sortOrder: data.sort_order,
            isActive: data.is_active
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 1 (Insert)
        // p_JsonData = Stringified JSON
        const result = await callProcedureMultiParam('usp_app_menus_insupd', [
            1,
            payload
        ]);

        // Return first row of result set for feedback (Message, etc.)
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Update Menu using JSON SP
     * @param {number} id 
     * @param {Object} data 
     */
    async update(id, data) {
        const model = new MenuModel({
            id: id,
            menuKey: data.menu_key,
            title: data.title,
            icon: data.icon,
            url: data.url,
            parentId: data.parent_id,
            sortOrder: data.sort_order,
            isActive: data.is_active
        });

        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 2 (Update)
        const result = await callProcedureMultiParam('usp_app_menus_insupd', [
            2,
            payload
        ]);
        return result && result.length > 0 ? result[0] : result;
    }

    /**
     * Delete Menu using JSON SP (Soft delete - deactivate)
     * @param {number} id 
     */
    async delete(id) {
        // Minimal data needed: id
        const model = new MenuModel({ id: id });
        const payload = JSON.stringify(model.toJsonForSp());

        // p_ActionType = 3 (Delete/Deactivate)
        const result = await callProcedureMultiParam('usp_app_menus_insupd', [
            3,
            payload
        ]);
        return result && result.length > 0 ? result[0] : result;
    }
}

module.exports = new MenuService();
