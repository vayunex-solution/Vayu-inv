const SequenceTransInterface = require("../../interfaces/sequence-trans/sequence-trans.interface");
const { SequenceTrans, SequenceTransDTO } = require("../../models/sequence-trans/sequence-trans.model");
const { callProcedureMultiParam, getPool } = require("../../../../core/database");

class SequenceTransService extends SequenceTransInterface {
    /**
     * Retrieve all transaction sequences
     * Uses usp_sequence_Trans_list with ActionType = 2
     */
    async getAll() {
        // p_ActionType = 2 (GetAll)
        // p_HeadName = ''
        // p_financialyear = ''
        // p_Start = 0
        // p_End = 100
        const result = await callProcedureMultiParam('usp_sequence_Trans_list', [
            2,
            '',
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
     * Retrieve a transaction sequence by Head Name and Financial Year
     * Uses usp_sequence_Trans_list with ActionType = 1
     */
    async getByNameAndFY(headName, financialYear) {
        const result = await callProcedureMultiParam('usp_sequence_Trans_list', [
            1, // ActionType: GetByName + FY
            headName,
            financialYear,
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

        return { success: false, message: "Transaction sequence not found" };
    }

    /**
     * Create or Update a transaction sequence
     * Uses usp_sequence_Trans_insupd with ActionType 1 (Insert) or 2 (Update)
     */
    async upsert(actionType, data) {
        const dto = new SequenceTransDTO(data);
        const params = dto.toSpParams(actionType);
        
        const pool = getPool();
        let connection;
        try {
            connection = await pool.getConnection();
            
            // 1. Initialize out parameter
            await connection.execute('SET @p_msg = ""');
            
            // 2. Call procedure
            // p_ActionType, p_HeadName, p_financial_year, p_Prefix, p_suffix, p_StartValue, 
            // p_StopValue, p_IncrementValue, p_LastValue, p_CreatedBy, p_ModifyBy, p_delimiter, OUT p_Message
            const placeholders = params.map(() => '?').join(', ');
            await connection.execute(`CALL usp_sequence_Trans_insupd(${placeholders}, @p_msg)`, params);
            
            // 3. Fetch message
            const [msgResult] = await connection.execute('SELECT @p_msg AS message');
            const message = msgResult[0]?.message;
            
            const isError = !message || message.toLowerCase().includes('error');
            
            return {
                success: !isError,
                message: message || (actionType === 1 ? "Record inserted successfully" : "Record updated successfully")
            };
        } catch (error) {
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    /**
     * Delete a transaction sequence
     * Uses usp_sequence_Trans_insupd with ActionType = 3
     */
    async delete(headName, financialYear) {
        return this.upsert(3, { headName, financialYear });
    }
}

module.exports = new SequenceTransService();
