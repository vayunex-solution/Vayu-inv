/**
 * HSN Service
 * Business logic for HSN Code Master
 * Relies purely on database stored procedures.
 */
const { callProcedure } = require('../../../core/database');
const { NotFoundException, ValidationException } = require('../../../core/exceptions');
const logger = require('../../../core/logger');

/**
 * Get all HSN codes with optional search filter
 */
const getHsnList = async ({ search = '', page = 1, limit = 100, is_active } = {}) => {
    try {
        const result = await callProcedure('sp_get_hsn_codes', { search, page, limit, is_active });
        return result.data || [];
    } catch (error) {
        logger.error('Error fetching HSN list from database', { error: error.message });
        throw error;
    }
};

/**
 * Get HSN dropdown (lightweight list for select inputs)
 */
const getHsnDropdown = async () => {
    try {
        const result = await callProcedure('sp_get_hsn_dropdown', {});
        return result.data || [];
    } catch (error) {
        logger.error('Error fetching HSN dropdown from database', { error: error.message });
        throw error;
    }
};

/**
 * Get HSN by ID
 */
const getHsnById = async (id) => {
    try {
        const result = await callProcedure('sp_get_hsn_by_id', { id });
        
        if (!result.data || result.data.length === 0) {
            throw new NotFoundException('HSN Code not found in database');
        }
        return result.data[0];
    } catch (error) {
        logger.error('Error fetching HSN by ID', { id, error: error.message });
        throw error;
    }
};

/**
 * Create new HSN code
 */
const createHsn = async (data, createdBy) => {
    const { hsn_code, description, tax_rate = 0 } = data;

    if (!hsn_code || hsn_code.trim() === '') {
        throw new ValidationException('Validation failed', [{ field: 'hsn_code', message: 'HSN code is required' }]);
    }
    
    logger.info('Creating HSN code in database', { hsn_code });

    try {
        const result = await callProcedure('sp_create_hsn', { hsn_code, description, tax_rate, created_by: createdBy });
        return result.data;
    } catch (error) {
        logger.error('Error creating HSN code', { hsn_code, error: error.message });
        throw error;
    }
};

/**
 * Update HSN code
 */
const updateHsn = async (id, data, updatedBy) => {
    const { hsn_code, description, tax_rate, is_active } = data;

    logger.info('Updating HSN code in database', { id });

    try {
        const result = await callProcedure('sp_update_hsn', { 
            id: parseInt(id), 
            hsn_code, 
            description, 
            tax_rate, 
            is_active, 
            updated_by: updatedBy 
        });
        return result.data || { id, ...data, updated_at: new Date().toISOString() };
    } catch (error) {
        logger.error('Error updating HSN code', { id, error: error.message });
        throw error;
    }
};

/**
 * Soft delete HSN code
 */
const deleteHsn = async (id) => {
    logger.info('Soft deleting HSN code in database', { id });

    try {
        await callProcedure('sp_delete_hsn', { id });
        return true;
    } catch (error) {
        logger.error('Error deleting HSN code', { id, error: error.message });
        throw error;
    }
};

module.exports = {
    getHsnList,
    getHsnDropdown,
    getHsnById,
    createHsn,
    updateHsn,
    deleteHsn
};

