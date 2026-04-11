const ItemInterface = require("../../interfaces/item/item.interface");
const { ItemMaster, ItemMasterDTO } = require("../../models/item/item.model");
const { callProcedureMultiParam, getPool } = require("../../../../core/database");

class ItemService extends ItemInterface {
    /**
     * Retrieve all items
     * Uses usp_items_master_list with ActionType = 2
     */
    async getAll() {
        const result = await callProcedureMultiParam('usp_items_master_list', [
            2, // ActionType: List
            0, // Id: Ignored
            0, // Start: Default
            100 // End: Default
        ]);

        if (result && result.success && Array.isArray(result.data)) {
            // SP returns 3 result sets: Data, TotalRecords, Metadata
            const data = result.data[0] || [];
            const totalRecords = result.data[1] && result.data[1][0] ? result.data[1][0].TotalRecords : data.length;
            const filters = result.data[2] || [];

            return {
                success: true,
                data: data,
                totalRecords: totalRecords,
                filters: filters
            };
        }
        
        return { success: false, message: "No data returned from database", data: [], totalRecords: 0 };
    }

    /**
     * Retrieve an item by ID
     * Uses usp_items_master_list with ActionType = 1
     */
    async getById(id) {
        const result = await callProcedureMultiParam('usp_items_master_list', [
            1, // ActionType: Detail
            id,
            0,
            0
        ]);

        if (result && result.success && result.data) {
            const rows = result.data;
            if (Array.isArray(rows) && rows.length > 0) {
                return {
                    success: true,
                    data: rows[0]
                };
            }
        }

        return { success: false, message: "Item not found" };
    }

    /**
     * Retrieve active items for dropdown
     * Uses usp_items_master_list with ActionType = 3
     */
    async getDropdown() {
        const result = await callProcedureMultiParam('usp_items_master_list', [
            3, // ActionType: Dropdown
            0, 0, 0
        ]);

        if (result && result.success && result.data) {
            return {
                success: true,
                data: result.data
            };
        }

        return { success: false, message: "No items found" };
    }

    /**
     * Create or Update an item
     * Uses usp_items_master_insupd with ActionType 1 (Insert) or 2 (Update)
     */
    async upsert(actionType, data) {
        const dto = new ItemMasterDTO(data);
        const params = dto.toSpParams(actionType);
        
        const pool = getPool();
        let connection;
        try {
            connection = await pool.getConnection();
            
            // 1. Initialize out parameter
            await connection.execute('SET @p_msg = ""');
            
            // 2. Call procedure
            // p_ActionType... p_Message (OUT)
            const placeholders = params.map(() => '?').join(', ');
            await connection.execute(`CALL usp_items_master_insupd(${placeholders}, @p_msg)`, params);
            
            // 3. Fetch message
            const [msgResult] = await connection.execute('SELECT @p_msg AS message');
            const message = msgResult[0]?.message;
            
            const isError = !message || message.toLowerCase().includes('error');
            
            return {
                success: !isError,
                message: message || (actionType === 1 ? "Item inserted successfully" : "Item updated successfully")
            };
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Delete an item
     * Uses usp_items_master_insupd with ActionType = 3
     */
    async delete(id) {
        return this.upsert(3, { itemId: id });
    }
}

module.exports = new ItemService();
