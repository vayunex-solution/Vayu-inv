/**
 * City Controller & Routes
 * Handles API endpoints for city management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/city/city.service");
const { authenticate } = require("../../../core/auth");

// --- Controller Methods ---

const getAll = async (req, res) => {
    try {
        const stateId = req.query.state_id || 0;
        const result = await service.getAll(stateId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDropdown = async (req, res) => {
    try {
        const stateId = req.query.state_id || 0;
        const result = await service.getDropdown(stateId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const result = await service.getById(req.params.id);
        if (!result) return res.status(404).json({ message: "City not found" });
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const create = async (req, res) => {
    try {
        const result = await service.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        const result = await service.update(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const result = await service.delete(req.params.id, req.body.updated_by);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Route Definitions ---

/**
 * @swagger
 * tags:
 *   name: Cities
 *   description: City management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/cities:
 *   get:
 *     summary: Get all cities
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: state_id
 *         schema:
 *           type: integer
 *         description: Filter by State ID
 *     responses:
 *       200:
 *         description: List of cities
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/inventory/cities/dropdown:
 *   get:
 *     summary: Get city dropdown list
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: state_id
 *         schema:
 *           type: integer
 *         description: Filter by State ID
 *     responses:
 *       200:
 *         description: Dropdown list of cities
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/dropdown', getDropdown);

/**
 * @swagger
 * /api/v1/inventory/cities/{id}:
 *   get:
 *     summary: Get city by ID
 *     tags: [Cities]
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
 *         description: City details
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/v1/inventory/cities:
 *   post:
 *     summary: Create new city
 *     tags: [Cities]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - city_name
 *               - state_id
 *               - country_id
 *             properties:
 *               city_name:
 *                  type: string
 *               district_id:
 *                  type: integer
 *               state_id:
 *                  type: integer
 *               country_id:
 *                  type: integer
 *               pincode:
 *                  type: string
 *               is_active:
 *                  type: string
 *                  enum: [Y, N]
 *                  default: Y
 *               created_by:
 *                  type: string
 *     responses:
 *       201:
 *         description: City created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.post('/', create);

/**
 * @swagger
 * /api/v1/inventory/cities/{id}:
 *   put:
 *     summary: Update city
 *     tags: [Cities]
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
 *               city_name:
 *                  type: string
 *               district_id:
 *                  type: integer
 *               state_id:
 *                  type: integer
 *               country_id:
 *                  type: integer
 *               pincode:
 *                  type: string
 *               is_active:
 *                  type: string
 *                  enum: [Y, N]
 *               updated_by:
 *                  type: string
 *     responses:
 *       200:
 *         description: City updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.put('/:id', update);

/**
 * @swagger
 * /api/v1/inventory/cities/{id}:
 *   delete:
 *     summary: Delete city
 *     tags: [Cities]
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
 *               updated_by:
 *                  type: string
 *     responses:
 *       200:
 *         description: City deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', remove);

module.exports = router;
