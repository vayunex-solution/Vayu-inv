const SequenceInterface = require("../../interfaces/sequence/sequence.interface");
const { Sequence, SequenceDTO } = require("../../models/sequence/sequence.model");
const { callProcedureMultiParam, getPool } = require("../../../../core/database");

class SequenceService extends SequenceInterface {
    /**
     * Retrieve all sequences
     * Uses usp_sequence_list_new with ActionType = 2
     */
    async getAll() {
        // p_ActionType = 2 (GetAll)
        // p_HeadName = ''
        // p_Start = 0
        // p_End = 100 (Default)
        const result = await callProcedureMultiParam('usp_sequence_list_new', [
            2,
            '',
            0,
            100
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
     * Retrieve a sequence by Head Name
     * Uses usp_sequence_list_new with ActionType = 1
     */
    async getByName(headName) {
        const result = await callProcedureMultiParam('usp_sequence_list_new', [
            1, // ActionType: GetByName
            headName,
            0,
            0
        ]);

        if (result && result.success && result.data) {
            // For ActionType 1, callProcedureMultiParam returns the array of rows directly in result.data
            // because data.length === 1 rule applies (see core/database/procedure.js:96)
            const rows = result.data;
            if (Array.isArray(rows) && rows.length > 0) {
                return {
                    success: true,
                    data: rows[0] // Return the single row object
                };
            }
        }

        return { success: false, message: "Sequence not found" };
    }

    /**
     * Create or Update a sequence
     * Uses usp_sequence_insupd with ActionType 1 (Insert) or 2 (Update)
     */
    async upsert(actionType, data) {
        const dto = new SequenceDTO(data);
        const params = dto.toSpParams(actionType);
        
        const pool = getPool();
        let connection;
        try {
            connection = await pool.getConnection();
            
            // 1. Initialize out parameter
            await connection.execute('SET @p_msg = ""');
            
            // 2. Call procedure
            // p_ActionType, p_HeadName, p_Prefix, p_StartValue, p_StopValue, p_IncrementValue, p_LastValue, p_CreatedBy, p_ModifyBy, OUT p_Message
            const placeholders = params.map(() => '?').join(', ');
            await connection.execute(`CALL usp_sequence_insupd(${placeholders}, @p_msg)`, params);
            
            // 3. Fetch message
            const [msgResult] = await connection.execute('SELECT @p_msg AS message');
            const message = msgResult[0]?.message;
            
            // Determine success based on message content
            const isError = !message || message.toLowerCase().includes('error');
            
            return {
                success: !isError,
                message: message || (actionType === 1 ? "Record inserted successfully" : "Record updated successfully")
            };
        } catch (error) {
            // If it's a known DB error, the exception handler in core will catch it, 
            // but here we just rethrow to let the controller handle it.
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Delete a sequence
     * Uses usp_sequence_insupd with ActionType = 3
     */
    async delete(headName) {
        return this.upsert(3, { headName });
    }
}

module.exports = new SequenceService();
