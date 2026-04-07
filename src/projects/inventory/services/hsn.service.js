/**
 * HSN Service
 * Business logic for HSN Code Master
 * Falls back to demo data if stored procedures are not yet deployed
 */
const { callProcedure } = require('../../../core/database');
const { NotFoundException, ValidationException } = require('../../../core/exceptions');
const logger = require('../../../core/logger');

const isProcedureNotFound = (error) => {
    const msg = (error.message || '').toLowerCase();
    return (
        msg.includes('procedure') ||
        msg.includes('not found') ||
        error.code === 'ER_SP_DOES_NOT_EXIST' ||
        error instanceof NotFoundException
    );
};

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_HSN = [
    { id: 1, hsn_code: '8471', description: 'Computers, printers and other office machines', tax_rate: 18.00, is_active: 1 },
    { id: 2, hsn_code: '3926', description: 'Other articles of plastics', tax_rate: 12.00, is_active: 1 },
    { id: 3, hsn_code: '7318', description: 'Screws, bolts, nuts and similar articles of iron or steel', tax_rate: 18.00, is_active: 1 },
    { id: 4, hsn_code: '8544', description: 'Insulated wire, cable and other insulated electric conductors', tax_rate: 18.00, is_active: 1 },
    { id: 5, hsn_code: '9013', description: 'Liquid crystal devices; lasers and other optical instruments', tax_rate: 18.00, is_active: 1 },
    { id: 6, hsn_code: '2710', description: 'Petroleum oils and oils obtained from bituminous minerals', tax_rate: 28.00, is_active: 1 },
    { id: 7, hsn_code: '0401', description: 'Milk and cream, not concentrated nor sweetened', tax_rate: 0.00, is_active: 1 },
    { id: 8, hsn_code: '1001', description: 'Wheat and meslin', tax_rate: 0.00, is_active: 1 },
];
// ──────────────────────────────────────────────────────────────────────────────

/**
 * Get all HSN codes with optional search filter
 */
const getHsnList = async ({ search = '', page = 1, limit = 100, is_active } = {}) => {
    try {
        const result = await callProcedure('sp_get_hsn_codes', { search, page, limit, is_active });
        return result.data || [];
    } catch (error) {
        if (isProcedureNotFound(error)) {
            logger.warn('sp_get_hsn_codes not found, returning demo data');
            let data = DEMO_HSN;
            if (search) {
                const s = search.toLowerCase();
                data = data.filter(h => h.hsn_code.includes(s) || h.description.toLowerCase().includes(s));
            }
            if (is_active !== undefined) {
                data = data.filter(h => h.is_active == is_active);
            }
            return data;
        }
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
        if (isProcedureNotFound(error)) {
            return DEMO_HSN.filter(h => h.is_active).map(h => ({
                id: h.id,
                hsn_code: h.hsn_code,
                description: h.description,
                tax_rate: h.tax_rate
            }));
        }
        throw error;
    }
};

/**
 * Get HSN by ID
 */
const getHsnById = async (id) => {
    try {
        const result = await callProcedure('sp_get_hsn_by_id', { id });
        if (!result.data || result.data.length === 0) throw new NotFoundException('HSN Code');
        return result.data[0];
    } catch (error) {
        if (isProcedureNotFound(error)) {
            const found = DEMO_HSN.find(h => h.id === id);
            if (!found) throw new NotFoundException('HSN Code');
            return found;
        }
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
    if (hsn_code.length > 20) {
        throw new ValidationException('Validation failed', [{ field: 'hsn_code', message: 'HSN code must be 20 characters or less' }]);
    }
    if (tax_rate < 0 || tax_rate > 100) {
        throw new ValidationException('Validation failed', [{ field: 'tax_rate', message: 'Tax rate must be between 0 and 100' }]);
    }

    logger.info('Creating HSN code', { hsn_code });

    try {
        const result = await callProcedure('sp_create_hsn', { hsn_code, description, tax_rate, created_by: createdBy });
        return result.data;
    } catch (error) {
        if (isProcedureNotFound(error)) {
            const newHsn = {
                id: Math.floor(Math.random() * 1000) + 100,
                hsn_code,
                description: description || null,
                tax_rate: parseFloat(tax_rate),
                is_active: 1,
                created_at: new Date().toISOString()
            };
            DEMO_HSN.push(newHsn);
            return newHsn;
        }
        throw error;
    }
};

/**
 * Update HSN code
 */
const updateHsn = async (id, data, updatedBy) => {
    await getHsnById(id); // Check exists

    const { hsn_code, description, tax_rate, is_active } = data;

    logger.info('Updating HSN code', { id });

    try {
        const result = await callProcedure('sp_update_hsn', { id, hsn_code, description, tax_rate, is_active, updated_by: updatedBy });
        return result.data || { id, ...data, updated_at: new Date().toISOString() };
    } catch (error) {
        if (isProcedureNotFound(error)) {
            const idx = DEMO_HSN.findIndex(h => h.id === id);
            if (idx > -1) Object.assign(DEMO_HSN[idx], { hsn_code, description, tax_rate, is_active });
            return DEMO_HSN[idx] || { id, ...data };
        }
        throw error;
    }
};

/**
 * Soft delete HSN code
 */
const deleteHsn = async (id) => {
    await getHsnById(id); // Check exists

    logger.info('Soft deleting HSN code', { id });

    try {
        await callProcedure('sp_delete_hsn', { id });
        return true;
    } catch (error) {
        if (isProcedureNotFound(error)) {
            const idx = DEMO_HSN.findIndex(h => h.id === id);
            if (idx > -1) DEMO_HSN[idx].is_active = 0;
            return true;
        }
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
