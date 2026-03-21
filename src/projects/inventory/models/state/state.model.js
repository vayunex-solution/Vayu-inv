const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads (if needed in future)
const State = sequelize.define("State", {
    stateId: { field: 'state_id', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    countryId: { field: 'country_id', type: DataTypes.INTEGER, allowNull: false },
    stateName: { field: 'state_name', type: DataTypes.STRING(100), allowNull: false },
    stateCode: { field: 'state_code', type: DataTypes.STRING(10), allowNull: false },
    gstStateCode: { field: 'gst_state_code', type: DataTypes.STRING(5), allowNull: true },
    isActive: { field: 'is_active', type: DataTypes.BOOLEAN, defaultValue: true },
    isDeleted: { field: 'is_deleted', type: DataTypes.BOOLEAN, defaultValue: false },
    createdBy: { field: 'created_by', type: DataTypes.INTEGER },
    createdOn: { field: 'created_on', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modifyBy: { field: 'modify_by', type: DataTypes.INTEGER },
    modifyOn: { field: 'modify_on', type: DataTypes.DATE }
}, {
    tableName: "tbl_state_master",
    timestamps: false
});

// Domain Model / DTO for JSON SP interaction
class StateModel {
    constructor(data) {
        this.stateId = data.stateId || 0;
        this.countryId = data.countryId || null;
        this.stateName = data.stateName || '';
        this.stateCode = data.stateCode || '';
        this.gstStateCode = data.gstStateCode || '';
        this.isStatus = data.isStatus !== undefined ? data.isStatus : true;
        this.createdBy = data.createdBy || null;
        this.modifyBy = data.modifyBy || null;
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_state_insupd stored procedure.
     * Keys must match exactly what the SP expects in JSON_EXTRACT.
     */
    toJsonForSp() {
        return {
            State_Id: parseInt(this.stateId, 10),
            Country_Id: parseInt(this.countryId, 10),
            State_Name: this.stateName,
            State_Code: this.stateCode,
            GST_State_Code: this.gstStateCode,
            IsStatus: this.isStatus ? 1 : 0,
            CreatedBy: this.createdBy ? parseInt(this.createdBy, 10) : null,
            ModifyBy: this.modifyBy ? parseInt(this.modifyBy, 10) : null
        };
    }
}

module.exports = { State, StateModel };
