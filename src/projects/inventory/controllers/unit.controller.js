/**
 * Units Master Controller & Routes
 * Handles API endpoints for Unit of Measurement management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/unit/unit.service");
const { authenticate } = require("../../../core/auth");

// --- Controller Methods ---

/**
 * Get all units
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
 * Get unit by ID
 */
const getById = async (req, res) => {
    try {
        const result = await service.getById(req.params.id);
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Get unit by Name
 */
const getByName = async (req, res) => {
    try {
        const result = await service.getByName(req.params.name);
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Create a new unit
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
 * Update an existing unit
 */
const update = async (req, res) => {
    try {
        const data = { ...req.body, unitId: req.params.id };
        const result = await service.upsert(2, data);
        const status = result.success ? 200 : 400;
        res.status(status).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Delete a unit
 */
const remove = async (req, res) => {
    try {
        const result = await service.delete(req.params.id);
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
 *   name: Units Master
 *   description: Unit of Measurement management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/units:
 *   get:
 *     summary: Get all units
 *     tags: [Units Master]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of units
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/inventory/units/{id}:
 *   get:
 *     summary: Get unit by ID
 *     tags: [Units Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Unit detail
 *       404:
 *         description: Not found
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/v1/inventory/units/name/{name}:
 *   get:
 *     summary: Get unit by Name
 *     tags: [Units Master]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unit detail
 *       404:
 *         description: Not found
 */
router.get('/name/:name', getByName);

/**
 * @swagger
 * /api/v1/inventory/units:
 *   post:
 *     summary: Create new unit
 *     tags: [Units Master]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - unitCode
 *               - unitName
 *             properties:
 *               unitCode:
 *                  type: string
 *               unitName:
 *                  type: string
 *               unitShortName:
 *                  type: string
 *               allowDecimal:
 *                  type: integer
 *               isActive:
 *                  type: integer
 *               createdBy:
 *                  type: integer
 *     responses:
 *       201:
 *         description: Unit created successfully
 *       400:
 *         description: Bad request
 */
router.post('/', create);

/**
 * @swagger
 * /api/v1/inventory/units/{id}:
 *   put:
 *     summary: Update unit
 *     tags: [Units Master]
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
 *               unitCode:
 *                  type: string
 *               unitName:
 *                  type: string
 *               unitShortName:
 *                  type: string
 *               allowDecimal:
 *                  type: integer
 *               isActive:
 *                  type: integer
 *               modifiedBy:
 *                  type: integer
 *     responses:
 *       200:
 *         description: Unit updated successfully
 *       400:
 *         description: Bad request
 */
router.put('/:id', update);

/**
 * @swagger
 * /api/v1/inventory/units/{id}:
 *   delete:
 *     summary: Delete unit
 *     tags: [Units Master]
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
