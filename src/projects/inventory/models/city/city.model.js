const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads (if needed in future)
const City = sequelize.define("City", {
    cityId: { field: 'CITYID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cityName: { field: 'CITYNAME', type: DataTypes.STRING(100), allowNull: false },
    districtId: { field: 'DISTRICTID', type: DataTypes.INTEGER, allowNull: true },
    stateId: { field: 'STATEID', type: DataTypes.INTEGER, allowNull: false },
    countryId: { field: 'COUNTRYID', type: DataTypes.INTEGER, allowNull: false },
    pincode: { field: 'PINCODE', type: DataTypes.STRING(10), allowNull: true },
    isActive: { field: 'ISACTIVE', type: DataTypes.STRING(1), defaultValue: 'Y' },
    createdBy: { field: 'CREATEDBY', type: DataTypes.STRING(50) },
    createdDate: { field: 'CREATEDDATE', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedBy: { field: 'UPDATEDBY', type: DataTypes.STRING(50) },
    updatedDate: { field: 'UPDATEDDATE', type: DataTypes.DATE }
}, {
    tableName: "tbl_citymaster",
    timestamps: false
});

// Domain Model / DTO for JSON SP interaction
class CityModel {
    constructor(data) {
        this.cityId = data.cityId || 0;
        this.cityName = data.cityName || '';
        this.districtId = data.districtId || 0;
        this.stateId = data.stateId || 0;
        this.countryId = data.countryId || 0;
        this.pincode = data.pincode || '';
        this.isActive = data.isActive || 'Y';
        this.createdBy = data.createdBy || '';
        this.updatedBy = data.updatedBy || '';
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_city_insupd stored procedure.
     * Keys must match exactly what the SP expects in JSON_EXTRACT.
     */
    toJsonForSp() {
        return {
            CityId: parseInt(this.cityId, 10),
            CityName: this.cityName,
            DistrictId: parseInt(this.districtId, 10),
            StateId: parseInt(this.stateId, 10),
            CountryId: parseInt(this.countryId, 10),
            Pincode: this.pincode,
            IsActive: this.isActive,
            CreatedBy: this.createdBy,
            UpdatedBy: this.updatedBy
        };
    }
}

module.exports = { City, CityModel };
