/**
 * Country Controller & Routes
 * Handles API endpoints for country management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/country/country.service");
const { authenticate } = require("../../../core/auth");

// --- Controller Methods ---

const getAll = async (req, res) => {
    try {
        const result = await service.getAll();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDropdown = async (req, res) => {
    try {
        const result = await service.getDropdown();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        const result = await service.getById(req.params.id);
        if (!result) return res.status(404).json({ message: "Country not found" });
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
 *   name: Countries
 *   description: Country management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/countries:
 *   get:
 *     summary: Get all countries
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of countries
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
 *                       Serial:
 *                         type: integer
 *                       CountryId:
 *                         type: integer
 *                       CountryName:
 *                         type: string
 *                       CountryCode:
 *                         type: string
 *                       IsActive:
 *                         type: integer
 *                       CreatedBy:
 *                         type: integer
 *                       CreatedOn:
 *                         type: string
 *                         format: date-time
 *                       ModifyBy:
 *                         type: integer
 *                       ModifyOn:
 *                         type: string
 *                         format: date-time
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
 * /api/v1/inventory/countries/dropdown:
 *   get:
 *     summary: Get country dropdown list
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dropdown list of countries
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
 *                       CountryId:
 *                         type: integer
 *                       CountryName:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/dropdown', getDropdown);

/**
 * @swagger
 * /api/v1/inventory/countries/{id}:
 *   get:
 *     summary: Get country by ID
 *     tags: [Countries]
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
 *         description: Country details
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
 *                     Serial:
 *                       type: integer
 *                     CountryId:
 *                       type: integer
 *                     CountryName:
 *                       type: string
 *                     CountryCode:
 *                       type: string
 *                     IsActive:
 *                       type: integer
 *                     IsDeleted:
 *                       type: integer
 *                     CreatedBy:
 *                       type: integer
 *                     CreatedOn:
 *                       type: string
 *                       format: date-time
 *                     ModifyBy:
 *                       type: integer
 *                     ModifyOn:
 *                       type: string
 *                       format: date-time
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
 * /api/v1/inventory/countries:
 *   post:
 *     summary: Create new country
 *     tags: [Countries]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - country_name
 *               - country_code
 *             properties:
 *               country_name: 
 *                  type: string
 *               country_code:
 *                  type: string
 *               is_status:
 *                  type: boolean
 *                  default: true
 *               created_by:
 *                  type: integer
 *     responses:
 *       201:
 *         description: Country created successfully
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
 * /api/v1/inventory/countries/{id}:
 *   put:
 *     summary: Update country
 *     tags: [Countries]
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
 *               country_name: 
 *                  type: string
 *               country_code:
 *                  type: string
 *               is_status:
 *                  type: boolean
 *               modify_by:
 *                  type: integer
 *     responses:
 *       200:
 *         description: Country updated successfully
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
 * /api/v1/inventory/countries/{id}:
 *   delete:
 *     summary: Delete country
 *     tags: [Countries]
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
 *         description: Country deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', remove);

module.exports = router;
