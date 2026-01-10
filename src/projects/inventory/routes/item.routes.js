/**
 * Item Routes
 * API routes for item management
 * 
 * @swagger
 * tags:
 *   name: Items
 *   description: Inventory item management
 */
const express = require('express');
const router = express.Router();
const itemController = require('../controllers/item.controller');
const { authenticate } = require('../../../core/auth');

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/items:
 *   get:
 *     summary: Get all items
 *     description: Retrieve a paginated list of inventory items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Filter by status
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/items', itemController.getItems);

/**
 * @swagger
 * /api/v1/inventory/items/{id}:
 *   get:
 *     summary: Get item by ID
 *     description: Retrieve a single item by its ID
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       200:
 *         description: Item retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/items/:id', itemController.getItemById);

/**
 * @swagger
 * /api/v1/inventory/items:
 *   post:
 *     summary: Create new item
 *     description: Create a new inventory item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - item_code
 *               - item_name
 *               - category_id
 *               - unit
 *               - unit_price
 *             properties:
 *               item_code:
 *                 type: string
 *                 example: ITM001
 *               item_name:
 *                 type: string
 *                 example: Sample Item
 *               description:
 *                 type: string
 *                 example: Item description
 *               category_id:
 *                 type: integer
 *                 example: 1
 *               unit:
 *                 type: string
 *                 example: PCS
 *               unit_price:
 *                 type: number
 *                 example: 100.50
 *               quantity:
 *                 type: number
 *                 example: 0
 *               reorder_level:
 *                 type: number
 *                 example: 10
 *     responses:
 *       201:
 *         description: Item created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/items', itemController.createItem);

/**
 * @swagger
 * /api/v1/inventory/items/{id}:
 *   put:
 *     summary: Update item
 *     description: Update an existing inventory item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               item_name:
 *                 type: string
 *               description:
 *                 type: string
 *               category_id:
 *                 type: integer
 *               unit:
 *                 type: string
 *               unit_price:
 *                 type: number
 *               reorder_level:
 *                 type: number
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Item updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/items/:id', itemController.updateItem);

/**
 * @swagger
 * /api/v1/inventory/items/{id}:
 *   delete:
 *     summary: Delete item
 *     description: Delete an inventory item
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Item ID
 *     responses:
 *       204:
 *         description: Item deleted successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.delete('/items/:id', itemController.deleteItem);

/**
 * @swagger
 * /api/v1/inventory/categories:
 *   get:
 *     summary: Get item categories
 *     description: Retrieve all item categories
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/categories', itemController.getCategories);

module.exports = router;
