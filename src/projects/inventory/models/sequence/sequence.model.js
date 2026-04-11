const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads
const Sequence = sequelize.define("Sequence", {
    serial: { field: 'serial', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    headName: { field: 'head_name', type: DataTypes.STRING(100), allowNull: false },
    prefix: { field: 'prefix', type: DataTypes.STRING(5), allowNull: true },
    startValue: { field: 'start_value', type: DataTypes.INTEGER },
    stopValue: { field: 'stop_value', type: DataTypes.INTEGER },
    incrementValue: { field: 'increment_value', type: DataTypes.INTEGER },
    lastValue: { field: 'last_value', type: DataTypes.INTEGER },
    createdBy: { field: 'created_by', type: DataTypes.INTEGER },
    createdOn: { field: 'created_on', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modifyBy: { field: 'modify_by', type: DataTypes.INTEGER },
    modifyOn: { field: 'modify_on', type: DataTypes.DATE }
}, {
    tableName: "tbl_sequence",
    timestamps: false
});

// Domain Model / DTO for SP interaction
class SequenceDTO {
    constructor(data) {
        this.headName = data.headName || data.head_name || '';
        this.prefix = data.prefix || '';
        this.startValue = data.startValue !== undefined ? data.startValue : (data.start_value !== undefined ? data.start_value : 0);
        this.stopValue = data.stopValue !== undefined ? data.stopValue : (data.stop_value !== undefined ? data.stop_value : 0);
        this.incrementValue = data.incrementValue !== undefined ? data.incrementValue : (data.increment_value !== undefined ? data.increment_value : 0);
        this.lastValue = data.lastValue !== undefined ? data.lastValue : (data.last_value !== undefined ? data.last_value : 0);
        this.createdBy = data.createdBy || data.created_by || null;
        this.modifyBy = data.modifyBy || data.modify_by || null;
    }

    /**
     * Prepares parameters for usp_sequence_insupd
     * @param {number} actionType 
     */
    toSpParams(actionType) {
        return [
            actionType,
            this.headName,
            this.prefix,
            this.startValue,
            this.stopValue,
            this.incrementValue,
            this.lastValue,
            this.createdBy,
            this.modifyBy
        ];
    }
}

module.exports = { Sequence, SequenceDTO };
