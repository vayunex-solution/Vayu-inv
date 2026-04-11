const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads
const SequenceTrans = sequelize.define("SequenceTrans", {
    serial: { field: 'serial', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    headName: { field: 'head_name', type: DataTypes.STRING(100), allowNull: false },
    financialYear: { field: 'financial_year', type: DataTypes.STRING(100) },
    prefix: { field: 'prefix', type: DataTypes.STRING(10) },
    suffix: { field: 'suffix', type: DataTypes.STRING(100) },
    startValue: { field: 'start_value', type: DataTypes.INTEGER },
    stopValue: { field: 'stop_value', type: DataTypes.INTEGER },
    incrementValue: { field: 'increment_value', type: DataTypes.INTEGER },
    lastValue: { field: 'last_val', type: DataTypes.INTEGER },
    createdBy: { field: 'created_by', type: DataTypes.INTEGER },
    createdOn: { field: 'created_on', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modifyBy: { field: 'modify_by', type: DataTypes.INTEGER },
    modifyOn: { field: 'modify_on', type: DataTypes.DATE },
    delimiter: { field: 'delimtr', type: DataTypes.STRING(5) }
}, {
    tableName: "tbl_sequence_trans",
    timestamps: false
});

// Domain Model / DTO for SP interaction
class SequenceTransDTO {
    constructor(data) {
        this.headName = data.headName || data.head_name || '';
        this.financialYear = data.financialYear || data.financial_year || '';
        this.prefix = data.prefix || '';
        this.suffix = data.suffix || '';
        this.startValue = data.startValue !== undefined ? data.startValue : (data.start_value !== undefined ? data.start_value : 0);
        this.stopValue = data.stopValue !== undefined ? data.stopValue : (data.stop_value !== undefined ? data.stop_value : 0);
        this.incrementValue = data.incrementValue !== undefined ? data.incrementValue : (data.increment_value !== undefined ? data.increment_value : 0);
        this.lastValue = data.lastValue !== undefined ? data.lastValue : (data.last_value !== undefined ? data.last_value : 0);
        this.createdBy = data.createdBy || data.created_by || null;
        this.modifyBy = data.modifyBy || data.modify_by || null;
        this.delimiter = data.delimiter || data.delimtr || '';
    }

    /**
     * Prepares parameters for usp_sequence_Trans_insupd
     * @param {number} actionType 
     */
    toSpParams(actionType) {
        return [
            actionType,
            this.headName,
            this.financialYear,
            this.prefix,
            this.suffix,
            this.startValue,
            this.stopValue,
            this.incrementValue,
            this.lastValue,
            this.createdBy,
            this.modifyBy,
            this.delimiter
        ];
    }
}

module.exports = { SequenceTrans, SequenceTransDTO };
