/**
 * Sequence Trans Controller & Routes
 * Handles API endpoints for Transaction Sequence management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/sequence-trans/sequence-trans.service");
const { authenticate } = require("../../../core/auth");

// --- Controller Methods ---

/**
 * Get all transaction sequences
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
 * Get transaction sequence by Head Name and Financial Year
 */
const getByNameAndFY = async (req, res) => {
    try {
        const { headName, financialYear } = req.params;
        const result = await service.getByNameAndFY(headName, financialYear);
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a new transaction sequence
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
 * Update an existing transaction sequence
 */
const update = async (req, res) => {
    try {
        const { headName, financialYear } = req.params;
        const data = { ...req.body, headName, financialYear };
        const result = await service.upsert(2, data);
        const status = result.success ? 200 : 400;
        res.status(status).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Delete a transaction sequence
 */
const remove = async (req, res) => {
    try {
        const { headName, financialYear } = req.params;
        const result = await service.delete(headName, financialYear);
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
 *   name: SequenceTrans
 *   description: Transaction Sequence management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/sequence-trans:
 *   get:
 *     summary: Get all transaction sequences
 *     tags: [SequenceTrans]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of transaction sequences
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/inventory/sequence-trans/{headName}/{financialYear}:
 *   get:
 *     summary: Get transaction sequence by Name and FY
 *     tags: [SequenceTrans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: headName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: financialYear
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Transaction sequence detail
 *       404:
 *         description: Not found
 */
router.get('/:headName/:financialYear', getByNameAndFY);

/**
 * @swagger
 * /api/v1/inventory/sequence-trans:
 *   post:
 *     summary: Create new transaction sequence
 *     tags: [SequenceTrans]
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
 *               - financialYear
 *             properties:
 *               headName:
 *                  type: string
 *               financialYear:
 *                  type: string
 *               prefix:
 *                  type: string
 *               suffix:
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
 *               delimiter:
 *                  type: string
 *     responses:
 *       201:
 *         description: Created
 *       400:
 *         description: Bad request
 */
router.post('/', create);

/**
 * @swagger
 * /api/v1/inventory/sequence-trans/{headName}/{financialYear}:
 *   put:
 *     summary: Update transaction sequence
 *     tags: [SequenceTrans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: headName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: financialYear
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
 *               suffix:
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
 *               delimiter:
 *                  type: string
 *     responses:
 *       200:
 *         description: Updated
 *       400:
 *         description: Bad request
 */
router.put('/:headName/:financialYear', update);

/**
 * @swagger
 * /api/v1/inventory/sequence-trans/{headName}/{financialYear}:
 *   delete:
 *     summary: Delete transaction sequence
 *     tags: [SequenceTrans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: headName
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: financialYear
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Deleted
 *       400:
 *         description: Bad request
 */
router.delete('/:headName/:financialYear', remove);

module.exports = router;
