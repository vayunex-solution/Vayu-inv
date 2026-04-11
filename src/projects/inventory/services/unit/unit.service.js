const UnitInterface = require("../../interfaces/unit/unit.interface");
const { UnitMaster, UnitMasterDTO } = require("../../models/unit/unit.model");
const { callProcedureMultiParam, getPool } = require("../../../../core/database");

class UnitService extends UnitInterface {
    /**
     * Retrieve all units
     * Uses usp_unitsmaster_list with ActionType = 2
     */
    async getAll() {
        const result = await callProcedureMultiParam('usp_unitsmaster_list', [
            2, // ActionType: GetAll
            '', // UnitName: Ignored
            0, // UnitId: Ignored
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
     * Retrieve a unit by ID
     * Uses usp_unitsmaster_list with ActionType = 3
     */
    async getById(id) {
        const result = await callProcedureMultiParam('usp_unitsmaster_list', [
            3, // ActionType: GetById
            '',
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

        return { success: false, message: "Unit not found" };
    }

    /**
     * Retrieve a unit by Name
     * Uses usp_unitsmaster_list with ActionType = 1
     */
    async getByName(name) {
        const result = await callProcedureMultiParam('usp_unitsmaster_list', [
            1, // ActionType: GetByName
            name,
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

        return { success: false, message: "Unit not found" };
    }

    /**
     * Create or Update a unit
     * Uses usp_unitsmaster_insupd with ActionType 1 (Insert) or 2 (Update)
     */
    async upsert(actionType, data) {
        const dto = new UnitMasterDTO(data);
        const params = dto.toSpParams(actionType);
        
        const pool = getPool();
        let connection;
        try {
            connection = await pool.getConnection();
            
            // 1. Initialize out parameter
            await connection.execute('SET @p_msg = ""');
            
            // 2. Call procedure
            // p_ActionType, p_UnitId, p_UnitCode, p_UnitName, p_UnitShortName, 
            // p_AllowDecimal, p_IsActive, p_CreatedBy, p_ModifiedBy, OUT p_Message
            const placeholders = params.map(() => '?').join(', ');
            await connection.execute(`CALL usp_unitsmaster_insupd(${placeholders}, @p_msg)`, params);
            
            // 3. Fetch message
            const [msgResult] = await connection.execute('SELECT @p_msg AS message');
            const message = msgResult[0]?.message;
            
            const isError = !message || message.toLowerCase().includes('error');
            
            return {
                success: !isError,
                message: message || (actionType === 1 ? "Unit inserted successfully" : "Unit updated successfully")
            };
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Delete a unit
     * Uses usp_unitsmaster_insupd with ActionType = 3
     */
    async delete(id) {
        return this.upsert(3, { unitId: id });
    }
}

module.exports = new UnitService();
