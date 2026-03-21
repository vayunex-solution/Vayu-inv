const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads
const HSN = sequelize.define("HSN", {
    gstHsnId: { field: 'GSTHSNID', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    hsnCode: { field: 'HSN_CODE', type: DataTypes.STRING(10), allowNull: false },
    hsnDesc: { field: 'HSN_DESC', type: DataTypes.STRING(200), allowNull: true },
    gstRate: { field: 'GSTRATE', type: DataTypes.DECIMAL(5, 2), allowNull: false },
    cgst: { field: 'CGST', type: DataTypes.DECIMAL(5, 2), allowNull: true },
    sgst: { field: 'SGST', type: DataTypes.DECIMAL(5, 2), allowNull: true },
    igst: { field: 'IGST', type: DataTypes.DECIMAL(5, 2), allowNull: true },
    cess: { field: 'CESS', type: DataTypes.DECIMAL(5, 2), allowNull: true },
    wefDate: { field: 'WEFDATE', type: DataTypes.DATE, allowNull: true },
    wefToDate: { field: 'WEFTODATE', type: DataTypes.DATE, allowNull: true },
    isActive: { field: 'ISACTIVE', type: DataTypes.CHAR(1), defaultValue: 'Y' },
    createdBy: { field: 'CREATEDBY', type: DataTypes.STRING(50) },
    createdDate: { field: 'CREATEDDATE', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedBy: { field: 'UPDATEDBY', type: DataTypes.STRING(50) },
    updatedDate: { field: 'UPDATEDDATE', type: DataTypes.DATE }
}, {
    tableName: "tbl_gst_hsn_master",
    timestamps: false
});

// Domain Model / DTO for JSON SP interaction
class HSNModel {
    constructor(data) {
        this.gstHsnId = data.gstHsnId || 0;
        this.hsnCode = data.hsnCode || '';
        this.hsnDesc = data.hsnDesc || '';
        this.gstRate = data.gstRate || 0;
        this.cgst = data.cgst || 0;
        this.sgst = data.sgst || 0;
        this.igst = data.igst || 0;
        this.cess = data.cess || 0;
        this.wefDate = data.wefDate || null;
        this.wefToDate = data.wefToDate || null;
        this.isActive = data.isActive !== undefined ? data.isActive : 'Y';
        this.createdBy = data.createdBy || null;
        this.updatedBy = data.updatedBy || null;
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_gst_hsn_insupd stored procedure.
     */
    toJsonForSp() {
        return {
            GSTHSNID: parseInt(this.gstHsnId, 10),
            HSN_CODE: this.hsnCode,
            HSN_DESC: this.hsnDesc,
            GSTRATE: parseFloat(this.gstRate) || 0,
            CGST: parseFloat(this.cgst) || 0,
            SGST: parseFloat(this.sgst) || 0,
            IGST: parseFloat(this.igst) || 0,
            CESS: parseFloat(this.cess) || 0,
            WEFDATE: this.wefDate,
            WEFTODATE: this.wefToDate,
            ISACTIVE: this.isActive,
            CREATEDBY: this.createdBy,
            UPDATEDBY: this.updatedBy
        };
    }
}

module.exports = { HSN, HSNModel };
