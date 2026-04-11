const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads
const UnitMaster = sequelize.define("UnitMaster", {
    unitId: { field: 'UnitId', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    unitCode: { field: 'UnitCode', type: DataTypes.STRING(10), allowNull: false },
    unitName: { field: 'UnitName', type: DataTypes.STRING(100), allowNull: false },
    unitShortName: { field: 'UnitShortName', type: DataTypes.STRING(20) },
    allowDecimal: { field: 'AllowDecimal', type: DataTypes.TINYINT, defaultValue: 0 },
    isActive: { field: 'IsActive', type: DataTypes.TINYINT, defaultValue: 1 },
    createdBy: { field: 'CreatedBy', type: DataTypes.INTEGER },
    createdOn: { field: 'CreatedOn', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modifiedBy: { field: 'ModifiedBy', type: DataTypes.INTEGER },
    modifiedOn: { field: 'ModifiedOn', type: DataTypes.DATE }
}, {
    tableName: "tbl_UnitsMaster",
    timestamps: false
});

// Domain Model / DTO for SP interaction
class UnitMasterDTO {
    constructor(data) {
        this.unitId = data.unitId || data.unit_id || 0;
        this.unitCode = data.unitCode || data.unit_code || '';
        this.unitName = data.unitName || data.unit_name || '';
        this.unitShortName = data.unitShortName || data.unit_short_name || '';
        this.allowDecimal = data.allowDecimal !== undefined ? data.allowDecimal : (data.allow_decimal !== undefined ? data.allow_decimal : 0);
        this.isActive = data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : 1);
        this.createdBy = data.createdBy || data.created_by || null;
        this.modifiedBy = data.modifiedBy || data.modified_by || null;
    }

    /**
     * Prepares parameters for usp_unitsmaster_insupd
     * @param {number} actionType 
     */
    toSpParams(actionType) {
        return [
            actionType,
            this.unitId,
            this.unitCode,
            this.unitName,
            this.unitShortName,
            this.allowDecimal,
            this.isActive,
            this.createdBy,
            this.modifiedBy
        ];
    }
}

module.exports = { UnitMaster, UnitMasterDTO };
