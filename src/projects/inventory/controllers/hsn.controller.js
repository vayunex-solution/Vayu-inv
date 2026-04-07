/**
 * HSN Controller
 * Full CRUD for HSN Code Master
 * Endpoints: GET all, POST create, GET dropdown, GET by ID, PUT update, DELETE (soft)
 */
const { asyncHandler } = require('../../../core/exceptions');
const { successResponse, createdResponse, noContentResponse } = require('../../../core/utils');
const hsnService = require('../services/hsn.service');

/**
 * GET /api/v1/inventory/hsn
 * Get all HSN codes
 */
const getHsnList = asyncHandler(async (req, res) => {
    const { search = '', page = 1, limit = 100, is_active } = req.query;
    const hsnList = await hsnService.getHsnList({ search, page: parseInt(page), limit: parseInt(limit), is_active });
    return successResponse(res, hsnList, 'HSN codes retrieved successfully');
});

/**
 * GET /api/v1/inventory/hsn/dropdown
 * Get HSN dropdown list (id, hsn_code, description, tax_rate)
 */
const getHsnDropdown = asyncHandler(async (req, res) => {
    const dropdown = await hsnService.getHsnDropdown();
    return successResponse(res, dropdown, 'HSN dropdown retrieved successfully');
});

/**
 * GET /api/v1/inventory/hsn/:id
 * Get HSN by ID
 */
const getHsnById = asyncHandler(async (req, res) => {
    const hsn = await hsnService.getHsnById(parseInt(req.params.id));
    return successResponse(res, hsn, 'HSN retrieved successfully');
});

/**
 * POST /api/v1/inventory/hsn
 * Create new HSN code
 */
const createHsn = asyncHandler(async (req, res) => {
    const hsn = await hsnService.createHsn(req.body, req.user?.id);
    return createdResponse(res, hsn, 'HSN created successfully');
});

/**
 * PUT /api/v1/inventory/hsn/:id
 * Update HSN code
 */
const updateHsn = asyncHandler(async (req, res) => {
    const hsn = await hsnService.updateHsn(parseInt(req.params.id), req.body, req.user?.id);
    return successResponse(res, hsn, 'HSN updated successfully');
});

/**
 * DELETE /api/v1/inventory/hsn/:id
 * Soft delete HSN code
 */
const deleteHsn = asyncHandler(async (req, res) => {
    await hsnService.deleteHsn(parseInt(req.params.id));
    return noContentResponse(res);
});

module.exports = {
    getHsnList,
    getHsnDropdown,
    getHsnById,
    createHsn,
    updateHsn,
    deleteHsn
};
