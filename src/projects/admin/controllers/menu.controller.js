/**
 * Menu Controller & Routes
 * Handles API endpoints for menu management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/menu/menu.service");
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

const getTreeList = async (req, res) => {
    try {
        const result = await service.getTreeList();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getById = async (req, res) => {
    try {
        console.log("Id", req.params.id);
        const result = await service.getById(req.params.id);
        if (!result || !result.success) {
            return res.status(404).json({ message: "Menu not found" });
        }
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
 *   name: Menus
 *   description: Application menu management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/admin/menus:
 *   get:
 *     summary: Get all menus
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of menus
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
 *                       id:
 *                         type: integer
 *                       menu_key:
 *                         type: string
 *                       title:
 *                         type: string
 *                       icon:
 *                         type: string
 *                       url:
 *                         type: string
 *                       parent_id:
 *                         type: integer
 *                       sort_order:
 *                         type: integer
 *                       is_active:
 *                         type: integer
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/admin/menus/dropdown:
 *   get:
 *     summary: Get menu dropdown list
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dropdown list of menus
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
 *                       Id:
 *                         type: integer
 *                       Title:
 *                         type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/dropdown', getDropdown);

/**
 * @swagger
 * /api/v1/admin/menus/tree:
 *   get:
 *     summary: Get hierarchical menu tree
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tree structure of menus
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   icon:
 *                     type: string
 *                   url:
 *                     type: string
 *                   children:
 *                     type: array
 *                     items:
 *                       type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/tree', getTreeList);

/**
 * @swagger
 * /api/v1/admin/menus/{id}:
 *   get:
 *     summary: Get menu by ID
 *     tags: [Menus]
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
 *         description: Menu details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     menu_key:
 *                       type: string
 *                     title:
 *                       type: string
 *                     icon:
 *                       type: string
 *                     url:
 *                       type: string
 *                     parent_id:
 *                       type: integer
 *                     sort_order:
 *                       type: integer
 *                     is_active:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
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
 * /api/v1/admin/menus:
 *   post:
 *     summary: Create new menu
 *     tags: [Menus]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - menu_key
 *               - title
 *             properties:
 *               menu_key: 
 *                  type: string
 *                  description: Unique menu key identifier
 *               title:
 *                  type: string
 *                  description: Menu display title
 *               icon:
 *                  type: string
 *                  description: Icon class or name
 *               url:
 *                  type: string
 *                  description: Menu URL/route
 *               parent_id:
 *                  type: integer
 *                  description: Parent menu ID for hierarchical menus
 *               sort_order:
 *                  type: integer
 *                  default: 0
 *                  description: Display order
 *               is_active:
 *                  type: boolean
 *                  default: true
 *                  description: Active status
 *     responses:
 *       201:
 *         description: Menu created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Message:
 *                   type: string
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
 * /api/v1/admin/menus/{id}:
 *   put:
 *     summary: Update menu
 *     tags: [Menus]
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
 *               menu_key: 
 *                  type: string
 *               title:
 *                  type: string
 *               icon:
 *                  type: string
 *               url:
 *                  type: string
 *               parent_id:
 *                  type: integer
 *               sort_order:
 *                  type: integer
 *               is_active:
 *                  type: boolean
 *     responses:
 *       200:
 *         description: Menu updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Message:
 *                   type: string
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
 * /api/v1/admin/menus/{id}:
 *   delete:
 *     summary: Delete menu (soft delete - deactivate)
 *     tags: [Menus]
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
 *         description: Menu deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Message:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', remove);

module.exports = router;
