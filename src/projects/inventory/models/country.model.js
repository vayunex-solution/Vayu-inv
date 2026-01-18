const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/db.config');

// Sequelize Model for Reads
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

// Domain Model / DTO for SP logic
class CountryModel {
    constructor(data) {
        this.countryId = data.countryId || 0;
        this.countryName = data.countryName || '';
        this.countryCode = data.countryCode || '';
        this.isStatus = data.isStatus;
        this.createdBy = data.createdBy || 0;
        this.modifyBy = data.modifyBy || 0;
    }

    // Map to Stored Procedure Parameters
    toSpParams(actionType) {
        return {
            Country_Id: parseInt(this.countryId, 10),
            Country_Name: this.countryName,
            Country_Code: this.countryCode,
            IsStatus: this.isStatus !== undefined ? (this.isStatus ? 1 : 0) : 1,
            CreatedBy: actionType === 1 ? this.createdBy : 0,
            ModifyBy: actionType !== 1 ? this.modifyBy : 0
        };
    }
}

module.exports = { Country, CountryModel };
