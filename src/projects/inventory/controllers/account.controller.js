/**
 * Account Controller & Routes
 * Handles API endpoints for Account Group and Account Head management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/account/account.service");
const { authenticate } = require("../../../core/auth");

// --- Account Group Controller Methods ---

const getAllGroups = async (req, res) => {
    try {
        const result = await service.getAllGroups();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGroupsDropdown = async (req, res) => {
    try {
        const result = await service.getGroupsDropdown();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGroupById = async (req, res) => {
    try {
        const result = await service.getGroupById(req.params.id);
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createGroup = async (req, res) => {
    try {
        const result = await service.createGroup(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateGroup = async (req, res) => {
    try {
        const result = await service.updateGroup(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteGroup = async (req, res) => {
    try {
        const result = await service.deleteGroup(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Account Head Controller Methods ---

const getAllHeads = async (req, res) => {
    try {
        const result = await service.getAllHeads();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHeadsDropdown = async (req, res) => {
    try {
        const result = await service.getHeadsDropdown();
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHeadById = async (req, res) => {
    try {
        const result = await service.getHeadById(req.params.id);
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createHead = async (req, res) => {
    try {
        const result = await service.createHead(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateHead = async (req, res) => {
    try {
        const result = await service.updateHead(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteHead = async (req, res) => {
    try {
        const result = await service.deleteHead(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Route Definitions ---

// Apply authentication to all routes
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   - name: Account Groups
 *     description: Account Group management
 *   - name: Account Heads
 *     description: Account Head management
 */

/**
 * @swagger
 * /api/v1/inventory/accounts/groups:
 *   get:
 *     summary: Get all account groups
 *     tags: [Account Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of account groups
 */
router.get('/groups', getAllGroups);

/**
 * @swagger
 * /api/v1/inventory/accounts/groups/dropdown:
 *   get:
 *     summary: Get account groups dropdown list
 *     tags: [Account Groups]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dropdown list of groups
 */
router.get('/groups/dropdown', getGroupsDropdown);

/**
 * @swagger
 * /api/v1/inventory/accounts/groups/{id}:
 *   get:
 *     summary: Get account group by ID
 *     tags: [Account Groups]
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
 *         description: Group details
 */
router.get('/groups/:id', getGroupById);

/**
 * @swagger
 * /api/v1/inventory/accounts/groups:
 *   post:
 *     summary: Create new account group
 *     tags: [Account Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               GroupName:
 *                 type: string
 *               ParentGroupId:
 *                 type: integer
 *               Position:
 *                 type: integer
 *               Belongsto:
 *                 type: string
 *               GroupType:
 *                 type: string
 *               BranchId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Group created successfully
 */
router.post('/groups', createGroup);

/**
 * @swagger
 * /api/v1/inventory/accounts/groups/{id}:
 *   put:
 *     summary: Update account group
 *     tags: [Account Groups]
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
 *               GroupName:
 *                 type: string
 *               ParentGroupId:
 *                 type: integer
 *               Position:
 *                 type: integer
 *               Belongsto:
 *                 type: string
 *               GroupType:
 *                 type: string
 *               BranchId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Group updated successfully
 */
router.put('/groups/:id', updateGroup);

/**
 * @swagger
 * /api/v1/inventory/accounts/groups/{id}:
 *   delete:
 *     summary: Delete account group
 *     tags: [Account Groups]
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
 *         description: Group deleted successfully
 */
router.delete('/groups/:id', deleteGroup);

// Account Head Routes

/**
 * @swagger
 * /api/v1/inventory/accounts/heads:
 *   get:
 *     summary: Get all account heads
 *     tags: [Account Heads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of account heads
 */
router.get('/heads', getAllHeads);

/**
 * @swagger
 * /api/v1/inventory/accounts/heads/dropdown:
 *   get:
 *     summary: Get account heads dropdown list
 *     tags: [Account Heads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dropdown list of heads
 */
router.get('/heads/dropdown', getHeadsDropdown);

/**
 * @swagger
 * /api/v1/inventory/accounts/heads/{id}:
 *   get:
 *     summary: Get account head by ID
 *     tags: [Account Heads]
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
 *         description: Head details
 */
router.get('/heads/:id', getHeadById);

/**
 * @swagger
 * /api/v1/inventory/accounts/heads:
 *   post:
 *     summary: Create new account head
 *     tags: [Account Heads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               accounthead:
 *                 type: string
 *               groupid:
 *                 type: integer
 *               branchid:
 *                 type: integer
 *               yearopeningbalance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Head created successfully
 */
router.post('/heads', createHead);

/**
 * @swagger
 * /api/v1/inventory/accounts/heads/{id}:
 *   put:
 *     summary: Update account head
 *     tags: [Account Heads]
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
 *               accounthead:
 *                 type: string
 *               groupid:
 *                 type: integer
 *               branchid:
 *                 type: integer
 *               yearopeningbalance:
 *                 type: number
 *     responses:
 *       200:
 *         description: Head updated successfully
 */
router.put('/heads/:id', updateHead);

/**
 * @swagger
 * /api/v1/inventory/accounts/heads/{id}:
 *   delete:
 *     summary: Delete account head
 *     tags: [Account Heads]
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
 *         description: Head deleted successfully
 */
router.delete('/heads/:id', deleteHead);

module.exports = router;
