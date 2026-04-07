/**
 * HSN Routes
 * Full CRUD routes for HSN Code Master
 *
 * @swagger
 * tags:
 *   name: HSN
 *   description: GST HSN code management
 */
const express = require('express');
const router = express.Router();
const hsnController = require('../controllers/hsn.controller');
const { authenticate } = require('../../../core/auth');

router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/hsn:
 *   get:
 *     summary: Get all HSN codes
 *     description: Retrieve all HSN codes with optional search filter
 *     tags: [HSN]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by code or description
 *     responses:
 *       200:
 *         description: HSN codes retrieved successfully
 */
router.get('/', hsnController.getHsnList);

/**
 * @swagger
 * /api/v1/inventory/hsn/dropdown:
 *   get:
 *     summary: Get HSN dropdown list
 *     description: Lightweight list for dropdown/select inputs
 *     tags: [HSN]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: HSN dropdown list retrieved
 */
router.get('/dropdown', hsnController.getHsnDropdown);

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
 *     responses:
 *       200:
 *         description: HSN retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get('/:id', hsnController.getHsnById);

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
 *             properties:
 *               hsn_code:
 *                 type: string
 *                 example: "8471"
 *               description:
 *                 type: string
 *                 example: "Computers and peripherals"
 *               tax_rate:
 *                 type: number
 *                 example: 18.00
 *     responses:
 *       201:
 *         description: HSN created successfully
 */
router.post('/', hsnController.createHsn);

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
 *     responses:
 *       200:
 *         description: HSN updated successfully
 */
router.put('/:id', hsnController.updateHsn);

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
 *     responses:
 *       204:
 *         description: HSN deleted successfully
 */
router.delete('/:id', hsnController.deleteHsn);

module.exports = router;
