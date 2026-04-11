const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads
const ItemMaster = sequelize.define("ItemMaster", {
    itemId: { field: 'ItemId', type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    itemCode: { field: 'ItemCode', type: DataTypes.STRING(50) },
    itemName: { field: 'ItemName', type: DataTypes.STRING(255), allowNull: false },
    itemDescription: { field: 'ItemDescription', type: DataTypes.STRING(500) },
    hsnCode: { field: 'HSNCode', type: DataTypes.STRING(10) },
    isTaxable: { field: 'IsTaxable', type: DataTypes.TINYINT, defaultValue: 1 },
    unitOfMeasurement: { field: 'UnitOfMeasurement', type: DataTypes.INTEGER },
    purchaseRate: { field: 'PurchaseRate', type: DataTypes.DECIMAL(18, 2) },
    salesRate: { field: 'SalesRate', type: DataTypes.DECIMAL(18, 2) },
    mrp: { field: 'MRP', type: DataTypes.DECIMAL(18, 2) },
    openingStock: { field: 'OpeningStock', type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    minStockLevel: { field: 'MinStockLevel', type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    maxStockLevel: { field: 'MaxStockLevel', type: DataTypes.DECIMAL(18, 2), defaultValue: 0 },
    itemType: { field: 'ItemType', type: DataTypes.STRING(50) },
    category: { field: 'Category', type: DataTypes.INTEGER },
    brand: { field: 'Brand', type: DataTypes.INTEGER },
    isActive: { field: 'IsActive', type: DataTypes.TINYINT, defaultValue: 1 },
    createdBy: { field: 'CreatedBy', type: DataTypes.INTEGER },
    createdOn: { field: 'CreatedOn', type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    modifiedBy: { field: 'ModifiedBy', type: DataTypes.INTEGER },
    modifiedOn: { field: 'ModifiedOn', type: DataTypes.DATE },
    isExempted: { field: 'IsExempted', type: DataTypes.TINYINT, defaultValue: 0 },
    isNilRated: { field: 'IsNilRated', type: DataTypes.TINYINT, defaultValue: 0 },
    reverseChargeApplicable: { field: 'ReverseChargeApplicable', type: DataTypes.TINYINT, defaultValue: 0 }
}, {
    tableName: "tbl_ItemsMaster",
    timestamps: false
});

// Domain Model / DTO for SP interaction
class ItemMasterDTO {
    constructor(data) {
        this.itemId = data.itemId || data.item_id || 0;
        this.itemName = data.itemName || data.item_name || '';
        this.itemDescription = data.itemDescription || data.item_description || '';
        this.hsnCode = data.hsnCode || data.hsn_code || '';
        this.isTaxable = data.isTaxable !== undefined ? data.isTaxable : (data.is_taxable !== undefined ? data.is_taxable : 1);
        this.unitOfMeasurement = data.unitOfMeasurement || data.unit_of_measurement || 0;
        this.purchaseRate = data.purchaseRate || data.purchase_rate || 0;
        this.salesRate = data.salesRate || data.sales_rate || 0;
        this.mrp = data.mrp || 0;
        this.openingStock = data.openingStock !== undefined ? data.openingStock : (data.opening_stock !== undefined ? data.opening_stock : 0);
        this.minStockLevel = data.minStockLevel !== undefined ? data.minStockLevel : (data.min_stock_level !== undefined ? data.min_stock_level : 0);
        this.maxStockLevel = data.maxStockLevel !== undefined ? data.maxStockLevel : (data.max_stock_level !== undefined ? data.max_stock_level : 0);
        this.itemType = data.itemType || data.item_type || '';
        this.category = data.category || 0;
        this.brand = data.brand || 0;
        this.isActive = data.isActive !== undefined ? data.isActive : (data.is_active !== undefined ? data.is_active : 1);
        this.createdBy = data.createdBy || data.created_by || null;
        this.modifiedBy = data.modifiedBy || data.modified_by || null;
        this.isExempted = data.isExempted !== undefined ? data.isExempted : (data.is_exempted !== undefined ? data.is_exempted : 0);
        this.isNilRated = data.isNilRated !== undefined ? data.isNilRated : (data.is_nil_rated !== undefined ? data.is_nil_rated : 0);
        this.reverseChargeApplicable = data.reverseChargeApplicable !== undefined ? data.reverseChargeApplicable : (data.reverse_charge_applicable !== undefined ? data.reverse_charge_applicable : 0);
    }

    /**
     * Prepares parameters for usp_items_master_insupd
     * @param {number} actionType 
     */
    toSpParams(actionType) {
        return [
            actionType,
            this.itemId,
            this.itemName,
            this.itemDescription,
            this.hsnCode,
            this.isTaxable,
            this.unitOfMeasurement,
            this.purchaseRate,
            this.salesRate,
            this.mrp,
            this.openingStock,
            this.minStockLevel,
            this.maxStockLevel,
            this.itemType,
            this.category,
            this.brand,
            this.isActive,
            this.createdBy,
            this.modifiedBy,
            this.isExempted,
            this.isNilRated,
            this.reverseChargeApplicable
        ];
    }
}

module.exports = { ItemMaster, ItemMasterDTO };
