const { DataTypes } = require('sequelize');
const sequelize = require('../../../../config/db.config');

// Sequelize Model for Reads
const Menu = sequelize.define("Menu", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    menuKey: { field: 'menu_key', type: DataTypes.STRING(50), allowNull: false, unique: true },
    title: { field: 'title', type: DataTypes.STRING(100), allowNull: false },
    icon: { field: 'icon', type: DataTypes.STRING(50), allowNull: true },
    url: { field: 'url', type: DataTypes.STRING(255), allowNull: true },
    parentId: { field: 'parent_id', type: DataTypes.INTEGER, allowNull: true },
    sortOrder: { field: 'sort_order', type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    isActive: { field: 'is_active', type: DataTypes.BOOLEAN, defaultValue: true, allowNull: false },
    createdAt: { field: 'created_at', type: DataTypes.DATE, defaultValue: DataTypes.NOW, allowNull: false },
    updatedAt: { field: 'updated_at', type: DataTypes.DATE, allowNull: true }
}, {
    tableName: "app_menus",
    timestamps: false
});

// Domain Model / DTO for JSON SP interaction
class MenuModel {
    constructor(data) {
        this.id = data.id || 0;
        this.menuKey = data.menuKey || '';
        this.title = data.title || '';
        this.icon = data.icon || null;
        this.url = data.url || null;
        this.parentId = data.parentId || null;
        this.sortOrder = data.sortOrder || 0;
        this.isActive = data.isActive !== undefined ? data.isActive : true;
    }

    /**
     * Converts the model instance to a JSON object specifically formatted 
     * for the usp_app_menus_insupd stored procedure.
     * Keys must match exactly what the SP expects in JSON_EXTRACT.
     */
    toJsonForSp() {
        return {
            id: parseInt(this.id, 10),
            menu_key: this.menuKey,
            title: this.title,
            icon: this.icon,
            url: this.url,
            parent_id: this.parentId ? parseInt(this.parentId, 10) : null,
            sort_order: parseInt(this.sortOrder, 10),
            is_active: this.isActive ? 1 : 0
        };
    }
}

module.exports = { Menu, MenuModel };
