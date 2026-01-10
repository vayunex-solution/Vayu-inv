/**
 * Item Model
 * Data model and validation for items
 */
const { ValidationException } = require('../../../core/exceptions');

/**
 * Item Model Class
 * Handles item data validation and transformation
 */
class ItemModel {
    /**
     * Create item model from request data
     * @param {Object} data - Request data
     */
    constructor(data = {}) {
        this.id = data.id || null;
        this.item_code = data.item_code || '';
        this.item_name = data.item_name || '';
        this.description = data.description || '';
        this.category_id = data.category_id || null;
        this.unit = data.unit || '';
        this.unit_price = parseFloat(data.unit_price) || 0;
        this.quantity = parseFloat(data.quantity) || 0;
        this.reorder_level = parseFloat(data.reorder_level) || 0;
        this.status = data.status || 'active';
    }

    /**
     * Validate item data for creation
     * @throws {ValidationException} If validation fails
     */
    validateForCreate() {
        const errors = [];

        if (!this.item_code || this.item_code.trim() === '') {
            errors.push({ field: 'item_code', message: 'Item code is required' });
        } else if (this.item_code.length > 50) {
            errors.push({ field: 'item_code', message: 'Item code must be 50 characters or less' });
        }

        if (!this.item_name || this.item_name.trim() === '') {
            errors.push({ field: 'item_name', message: 'Item name is required' });
        } else if (this.item_name.length > 200) {
            errors.push({ field: 'item_name', message: 'Item name must be 200 characters or less' });
        }

        if (!this.category_id) {
            errors.push({ field: 'category_id', message: 'Category is required' });
        }

        if (!this.unit || this.unit.trim() === '') {
            errors.push({ field: 'unit', message: 'Unit is required' });
        }

        if (this.unit_price < 0) {
            errors.push({ field: 'unit_price', message: 'Unit price cannot be negative' });
        }

        if (errors.length > 0) {
            throw new ValidationException('Validation failed', errors);
        }

        return true;
    }

    /**
     * Validate item data for update
     * @throws {ValidationException} If validation fails
     */
    validateForUpdate() {
        const errors = [];

        if (this.item_name && this.item_name.length > 200) {
            errors.push({ field: 'item_name', message: 'Item name must be 200 characters or less' });
        }

        if (this.unit_price !== undefined && this.unit_price < 0) {
            errors.push({ field: 'unit_price', message: 'Unit price cannot be negative' });
        }

        if (this.status && !['active', 'inactive'].includes(this.status)) {
            errors.push({ field: 'status', message: 'Status must be active or inactive' });
        }

        if (errors.length > 0) {
            throw new ValidationException('Validation failed', errors);
        }

        return true;
    }

    /**
     * Convert to JSON for stored procedure
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            item_code: this.item_code,
            item_name: this.item_name,
            description: this.description,
            category_id: this.category_id,
            unit: this.unit,
            unit_price: this.unit_price,
            quantity: this.quantity,
            reorder_level: this.reorder_level,
            status: this.status
        };
    }

    /**
     * Convert to JSON for create procedure
     * @returns {Object} JSON for creation
     */
    toCreateJSON() {
        return {
            item_code: this.item_code,
            item_name: this.item_name,
            description: this.description,
            category_id: this.category_id,
            unit: this.unit,
            unit_price: this.unit_price,
            quantity: this.quantity,
            reorder_level: this.reorder_level
        };
    }

    /**
     * Convert to JSON for update procedure
     * @param {number} id - Item ID
     * @returns {Object} JSON for update
     */
    toUpdateJSON(id) {
        const json = { id };

        if (this.item_name) json.item_name = this.item_name;
        if (this.description !== undefined) json.description = this.description;
        if (this.category_id) json.category_id = this.category_id;
        if (this.unit) json.unit = this.unit;
        if (this.unit_price !== undefined) json.unit_price = this.unit_price;
        if (this.reorder_level !== undefined) json.reorder_level = this.reorder_level;
        if (this.status) json.status = this.status;

        return json;
    }
}

module.exports = { ItemModel };
