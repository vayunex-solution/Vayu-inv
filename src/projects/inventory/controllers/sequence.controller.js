/**
 * Sequence Controller & Routes
 * Handles API endpoints for Sequence management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/sequence/sequence.service");
const { authenticate } = require("../../../core/auth");

// --- Controller Methods ---

/**
 * Get all sequences
 * No mandatory parameters
 */
const getAll = async (req, res) => {
    try {
        const result = await service.getAll();
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get sequence by Head Name
 */
const getByName = async (req, res) => {
    try {
        const result = await service.getByName(req.params.headName);
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a new sequence
 */
const create = async (req, res) => {
    try {
        const result = await service.upsert(1, req.body);
        const status = result.success ? 201 : 400;
        res.status(status).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Update an existing sequence
 */
const update = async (req, res) => {
    try {
        const data = { ...req.body, headName: req.params.headName };
        const result = await service.upsert(2, data);
        const status = result.success ? 200 : 400;
        res.status(status).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Delete a sequence
 */
const remove = async (req, res) => {
    try {
        const result = await service.delete(req.params.headName);
        const status = result.success ? 200 : 400;
        res.status(status).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// --- Route Definitions ---

/**
 * @swagger
 * tags:
 *   name: Sequence
 *   description: Sequence management (ID generation)
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/sequences:
 *   get:
 *     summary: Get all sequences
 *     tags: [Sequence]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sequences
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/inventory/sequences/{headName}:
 *   get:
 *     summary: Get sequence by Head Name
 *     tags: [Sequence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: headName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sequence detail
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *       404:
 *         description: Sequence not found
 */
router.get('/:headName', getByName);

/**
 * @swagger
 * /api/v1/inventory/sequences:
 *   post:
 *     summary: Create new sequence
 *     tags: [Sequence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - headName
 *             properties:
 *               headName:
 *                  type: string
 *               prefix:
 *                  type: string
 *               startValue:
 *                  type: integer
 *               stopValue:
 *                  type: integer
 *               incrementValue:
 *                  type: integer
 *               lastValue:
 *                  type: integer
 *               createdBy:
 *                  type: integer
 *     responses:
 *       201:
 *         description: Sequence created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', create);

/**
 * @swagger
 * /api/v1/inventory/sequences/{headName}:
 *   put:
 *     summary: Update sequence
 *     tags: [Sequence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: headName
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prefix:
 *                  type: string
 *               startValue:
 *                  type: integer
 *               stopValue:
 *                  type: integer
 *               incrementValue:
 *                  type: integer
 *               lastValue:
 *                  type: integer
 *               modifyBy:
 *                  type: integer
 *     responses:
 *       200:
 *         description: Sequence updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/:headName', update);

/**
 * @swagger
 * /api/v1/inventory/sequences/{headName}:
 *   delete:
 *     summary: Delete sequence
 *     tags: [Sequence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: headName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Sequence deleted successfully
 *       400:
 *         description: Bad request
 */
router.delete('/:headName', remove);

module.exports = router;
