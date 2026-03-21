/**
 * State Controller & Routes
 * Handles API endpoints for state management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/state/state.service");
const { authenticate } = require("../../../core/auth");

// --- Controller Methods ---

const getAll = async (req, res) => {
    try {
        const countryId = req.query.country_id || 0;
        const result = await service.getAll(countryId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDropdown = async (req, res) => {
    try {
        const countryId = req.query.country_id || 0;
        const result = await service.getDropdown(countryId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const result = await service.getById(req.params.id);
        if (!result) return res.status(404).json({ message: "State not found" });
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
        const result = await service.delete(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Route Definitions ---

/**
 * @swagger
 * tags:
 *   name: States
 *   description: State management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/states:
 *   get:
 *     summary: Get all states
 *     tags: [States]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: country_id
 *         schema:
 *           type: integer
 *         description: Filter by Country ID
 *     responses:
 *       200:
 *         description: List of states
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
 *                     properties:
 *                       StateId:
 *                         type: integer
 *                       CountryId:
 *                         type: integer
 *                       StateName:
 *                         type: string
 *                       GST_State_Code:
 *                         type: string
 *                       IsStatus:
 *                         type: integer
 *                       CreatedBy:
 *                         type: integer
 *                       ModifyBy:
 *                         type: integer
 *                 totalRecords:
 *                   type: integer
 *                 filters:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                        key: 
 *                          type: string
 *                        type: 
 *                          type: string
 *                        label: 
 *                           type: string
 *                        operator: 
 *                           type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/inventory/states/dropdown:
 *   get:
 *     summary: Get state dropdown list
 *     tags: [States]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: country_id
 *         schema:
 *           type: integer
 *         description: Filter by Country ID
 *     responses:
 *       200:
 *         description: Dropdown list of states
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                    type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       StateId:
 *                         type: integer
 *                       StateName:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/dropdown', getDropdown);

/**
 * @swagger
 * /api/v1/inventory/states/{id}:
 *   get:
 *     summary: Get state by ID
 *     tags: [States]
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
 *         description: State details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                    type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     StateId:
 *                       type: integer
 *                     CountryId:
 *                       type: integer
 *                     StateName:
 *                       type: string
 *                     GST_State_Code:
 *                       type: string
 *                     IsStatus:
 *                       type: integer
 *                     CreatedBy:
 *                       type: integer
 *                     ModifyBy:
 *                       type: integer
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
 * /api/v1/inventory/states:
 *   post:
 *     summary: Create new state
 *     tags: [States]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - country_id
 *               - state_name
 *               - state_code
 *             properties:
 *               country_id:
 *                  type: integer
 *               state_name: 
 *                  type: string
 *               state_code:
 *                  type: string
 *               gst_state_code:
 *                  type: string
 *               is_status:
 *                  type: boolean
 *                  default: true
 *               created_by:
 *                  type: integer
 *     responses:
 *       201:
 *         description: State created successfully
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
 * /api/v1/inventory/states/{id}:
 *   put:
 *     summary: Update state
 *     tags: [States]
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
 *               country_id:
 *                  type: integer
 *               state_name: 
 *                  type: string
 *               state_code:
 *                  type: string
 *               gst_state_code:
 *                  type: string
 *               is_status:
 *                  type: boolean
 *               modify_by:
 *                  type: integer
 *     responses:
 *       200:
 *         description: State updated successfully
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
 * /api/v1/inventory/states/{id}:
 *   delete:
 *     summary: Delete state
 *     tags: [States]
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
 *         description: State deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', remove);

module.exports = router;
