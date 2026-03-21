/**
 * Financial Year (FY) Model / DTO for JSON SP interaction
 */
class FYModel {
    constructor(data) {
        this.fyId = data.fyId || 0;
        this.fyName = data.fyName || '';
        this.fyStDate = data.fyStDate || null;
        this.fyEndDate = data.fyEndDate || null;
        this.isCurrentFy = data.isCurrentFy !== undefined ? data.isCurrentFy : 'N';
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_fy_insupd stored procedure.
     * Keys must match exactly what the SP expects in JSON_EXTRACT.
     */
    toJsonForSp() {
        return {
            FYID: parseInt(this.fyId, 10),
            FYNAME: this.fyName,
            FYSTDATE: this.fyStDate,
            FYENDDATE: this.fyEndDate,
            ISCURRENTFY: this.isCurrentFy
        };
    }
}

module.exports = { FYModel };
