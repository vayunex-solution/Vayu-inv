const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads
const ItemCategory = sequelize.define("ItemCategory", {
    categoryId: { field: 'CATEGORYID', type: DataTypes.INTEGER, primaryKey: true },
    categoryName: { field: 'CATEGORYNAME', type: DataTypes.STRING(100), allowNull: false },
    parentId: { field: 'PARENTID', type: DataTypes.INTEGER, allowNull: true },
    isActive: { field: 'ISACTIVE', type: DataTypes.CHAR(1), defaultValue: 'Y' },
    createdBy: { field: 'CREATEDBY', type: DataTypes.STRING(50) },
    createdDate: { field: 'CREATEDDATE', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updatedBy: { field: 'UPDATEDBY', type: DataTypes.STRING(50) },
    updatedDate: { field: 'UPDATEDDATE', type: DataTypes.DATE }
}, {
    tableName: "tbl_itemCategory_master",
    timestamps: false
});

// Domain Model / DTO for JSON SP interaction
class ItemCategoryModel {
    constructor(data) {
        this.categoryId = data.categoryId || 0;
        this.categoryName = data.categoryName || '';
        this.parentId = data.parentId || null;
        this.isActive = data.isActive !== undefined ? data.isActive : 'Y';
        this.createdBy = data.createdBy || null;
        this.updatedBy = data.updatedBy || null;
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_itemcategory_insupd stored procedure.
     */
    toJsonForSp() {
        return {
            CategoryId: parseInt(this.categoryId, 10),
            CategoryName: this.categoryName,
            ParentId: this.parentId ? parseInt(this.parentId, 10) : null,
            IsActive: this.isActive,
            CreatedBy: this.createdBy,
            UpdatedBy: this.updatedBy
        };
    }
}

module.exports = { ItemCategory, ItemCategoryModel };
