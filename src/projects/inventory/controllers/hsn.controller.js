/**
 * HSN Controller & Routes
 * Handles API endpoints for HSN management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/hsn/hsn.service");
const { authenticate } = require("../../../core/auth");

// --- Controller Methods ---

const getAll = async (req, res) => {
    try {
        const result = await service.getAll();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDropdown = async (req, res) => {
    try {
        const result = await service.getDropdown();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const result = await service.getById(req.params.id);
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await service.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const result = await service.update(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const result = await service.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- Route Definitions ---

/**
 * @swagger
 * tags:
 *   name: HSN
 *   description: GST HSN management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/hsn:
 *   get:
 *     summary: Get all HSN codes
 *     tags: [HSN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of HSN codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 totalRecords:
 *                   type: integer
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/inventory/hsn/dropdown:
 *   get:
 *     summary: Get HSN dropdown list
 *     tags: [HSN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dropdown list of HSN codes
 */
router.get('/dropdown', getDropdown);

/**
 * @swagger
 * /api/v1/inventory/hsn/{id}:
 *   get:
 *     summary: Get HSN by ID
 *     tags: [HSN]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/v1/inventory/hsn:
 *   post:
 *     summary: Create new HSN
 *     tags: [HSN]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hsn_code
 *               - gst_rate
 *             properties:
 *               hsn_code:
 *                  type: string
 *               hsn_desc:
 *                  type: string
 *               gst_rate:
 *                  type: number
 *               cgst:
 *                  type: number
 *               sgst:
 *                  type: number
 *               igst:
 *                  type: number
 *               cess:
 *                  type: number
 *               wef_date:
 *                  type: string
 *                  format: date
 *               wef_todate:
 *                  type: string
 *                  format: date
 *               is_active:
 *                  type: string
 *                  enum: [Y, N]
 *               created_by:
 *                  type: string
 */
router.post('/', create);

/**
 * @swagger
 * /api/v1/inventory/hsn/{id}:
 *   put:
 *     summary: Update HSN
 *     tags: [HSN]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               hsn_code:
 *                  type: string
 *               hsn_desc:
 *                  type: string
 *               gst_rate:
 *                  type: number
 *               cgst:
 *                  type: number
 *               sgst:
 *                  type: number
 *               igst:
 *                  type: number
 *               cess:
 *                  type: number
 *               wef_date:
 *                  type: string
 *               wef_todate:
 *                  type: string
 *               is_active:
 *                  type: string
 *               updated_by:
 *                  type: string
 */
router.put('/:id', update);

/**
 * @swagger
 * /api/v1/inventory/hsn/{id}:
 *   delete:
 *     summary: Delete HSN (Soft)
 *     tags: [HSN]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.delete('/:id', remove);

module.exports = router;
