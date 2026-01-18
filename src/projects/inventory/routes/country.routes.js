/**
 * Country Routes
 * API routes for country management
 * 
 * @swagger
 * tags:
 *   name: Countries
 *   description: Country management
 */
const express = require('express');
const router = express.Router();
const countryController = require('../controllers/country.controller');
const { authenticate } = require('../../../core/auth');

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/countries:
 *   post:
 *     summary: Create new country
 *     description: Create a new country
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
 *                 type: string
 *                 example: India
 *               country_code:
 *                 type: string
 *                 example: IN
 *               is_status:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Country created successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/', countryController.getAll);
router.get('/:id', countryController.getById);
router.post('/', countryController.create);
router.put('/:id', countryController.update);
router.delete('/:id', countryController.delete);

module.exports = router;
