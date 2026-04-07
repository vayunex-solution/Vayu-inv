/**
 * Item Category Controller & Routes
 * Handles API endpoints for item category management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/itemcategory/itemcategory.service");
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
 *   name: Item Categories
 *   description: Item category management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/item-categories:
 *   get:
 *     summary: Get all item categories
 *     tags: [Item Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of item categories
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/inventory/item-categories/dropdown:
 *   get:
 *     summary: Get item category dropdown list
 *     tags: [Item Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dropdown list of item categories
 */
router.get('/dropdown', getDropdown);

/**
 * @swagger
 * /api/v1/inventory/item-categories/{id}:
 *   get:
 *     summary: Get item category by ID
 *     tags: [Item Categories]
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
 * /api/v1/inventory/item-categories:
 *   post:
 *     summary: Create new item category
 *     tags: [Item Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_name
 *             properties:
 *               category_name:
 *                  type: string
 *               parent_id:
 *                  type: integer
 *               is_active:
 *                  type: string
 *                  enum: [Y, N]
 *               created_by:
 *                  type: string
 */
router.post('/', create);

/**
 * @swagger
 * /api/v1/inventory/item-categories/{id}:
 *   put:
 *     summary: Update item category
 *     tags: [Item Categories]
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
 *               category_name:
 *                  type: string
 *               parent_id:
 *                  type: integer
 *               is_active:
 *                  type: string
 *               updated_by:
 *                  type: string
 */
router.put('/:id', update);

/**
 * @swagger
 * /api/v1/inventory/item-categories/{id}:
 *   delete:
 *     summary: Delete item category (Soft)
 *     tags: [Item Categories]
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
