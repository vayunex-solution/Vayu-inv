const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads (Unchanged for now, used for getAll/getById if direct SQL SELECT is preferred, 
// OR can be used if SP returns dataset that matches this structure)
const Country = sequelize.define("Country", {
    serial: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    countryId: { field: 'country_id', type: DataTypes.INTEGER, unique: true, allowNull: false },
    countryName: { field: 'country_name', type: DataTypes.STRING(100), allowNull: false },
    countryCode: { field: 'country_code', type: DataTypes.STRING(5), allowNull: false, unique: true },
    isActive: { field: 'is_status', type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
    isDeleted: { field: 'is_deleted', type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
    createdBy: { field: 'created_by', type: DataTypes.INTEGER, allowNull: true },
    createdOn: { field: 'created_on', type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    modifyBy: { field: 'modify_by', type: DataTypes.INTEGER, allowNull: true },
    modifyOn: { field: 'modify_on', type: DataTypes.DATE, allowNull: true }
}, {
    tableName: "tbl_country",
    timestamps: false
});

// Domain Model / DTO for JSON SP interaction
class CountryModel {
    constructor(data) {
        this.countryId = data.countryId || 0;
        this.countryName = data.countryName || '';
        this.countryCode = data.countryCode || '';
        this.isStatus = data.isStatus;
        this.createdBy = data.createdBy || 0;
        this.modifyBy = data.modifyBy || 0;
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_country_insupd stored procedure.
     * Keys must match exactly what the SP expects in JSON_EXTRACT.
     */
    toJsonForSp() {
        return {
            Country_Id: parseInt(this.countryId, 10),
            Country_Name: this.countryName,
            Country_Code: this.countryCode,
            // SP expects IsStatus (or defaults to 1). Explicitly passing boolean or int 1/0 is fine for JSON.
            IsStatus: this.isStatus !== undefined ? (this.isStatus ? 1 : 0) : 1,
            CreatedBy: this.createdBy,
            ModifyBy: this.modifyBy
        };
    }
}

module.exports = { Country, CountryModel };
