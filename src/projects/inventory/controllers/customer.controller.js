/**
 * Customer Master Controller & Routes
 * Handles API endpoints for customer management
 */
const express = require('express');
const router = express.Router();
const service = require("../services/customer/customer.service");
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
        if (!result.success) return res.status(404).json(result);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const create = async (req, res) => {
    try {
        // Fallback to authenticated user id if not provided in payload
        if (req.user && req.user.userId) {
            req.body.created_by = req.body.created_by || req.user.userId;
        }
        const result = await service.create(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const update = async (req, res) => {
    try {
        // Fallback to authenticated user id if not provided in payload
        if (req.user && req.user.userId) {
            req.body.updated_by = req.body.updated_by || req.user.userId;
        }
        const result = await service.update(req.params.id, req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const remove = async (req, res) => {
    try {
        const deletedBy = req.body.updated_by || (req.user ? req.user.userId : 0);
        const result = await service.delete(req.params.id, deletedBy);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- Route Definitions ---

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Customer & Address management
 */

// Apply authentication
router.use(authenticate);

/**
 * @swagger
 * /api/v1/inventory/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/v1/inventory/customers/dropdown:
 *   get:
 *     summary: Get customer dropdown list
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dropdown list of customers
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.get('/dropdown', getDropdown);

/**
 * @swagger
 * /api/v1/inventory/customers/{id}:
 *   get:
 *     summary: Get customer by ID (includes addresses)
 *     tags: [Customers]
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
 *         description: Customer details
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
 * /api/v1/inventory/customers:
 *   post:
 *     summary: Create new customer with addresses
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CustomerName
 *               - PAN
 *             properties:
 *               CustomerName:
 *                  type: string
 *               LegalName:
 *                  type: string
 *               GSTIN:
 *                  type: string
 *               PAN:
 *                  type: string
 *               IsGSTRegistered:
 *                  type: integer
 *                  enum: [0, 1]
 *               MobileNo:
 *                  type: string
 *               Email:
 *                  type: string
 *               CustomerType:
 *                  type: string
 *                  default: B2B
 *               IsActive:
 *                  type: integer
 *                  enum: [0, 1]
 *                  default: 1
 *               created_by:
 *                  type: integer
 *               Addresses:
 *                  type: array
 *                  items:
 *                    type: object
 *                    required:
 *                      - AddressLine1
 *                      - CountryId
 *                      - StateId
 *                      - CityId
 *                      - Pincode
 *                    properties:
 *                      AddressType:
 *                        type: string
 *                        default: Billing
 *                      AddressLine1:
 *                        type: string
 *                      AddressLine2:
 *                        type: string
 *                      CountryId:
 *                        type: integer
 *                      StateId:
 *                        type: integer
 *                      DistrictId:
 *                        type: integer
 *                      CityId:
 *                        type: integer
 *                      Pincode:
 *                        type: string
 *                      GSTIN:
 *                        type: string
 *                      PAN:
 *                        type: string
 *                      ContactPerson:
 *                        type: string
 *                      MobileNo:
 *                        type: string
 *                      WhatsAppNo:
 *                        type: string
 *                      RMN:
 *                        type: string
 *                      Email:
 *                        type: string
 *                      BankName:
 *                        type: string
 *                      AccountNumber:
 *                        type: string
 *                      IFSCCode:
 *                        type: string
 *                      BranchName:
 *                        type: string
 *                      IsDefault:
 *                        type: integer
 *                        enum: [0, 1]
 *                      IsActive:
 *                        type: integer
 *                        enum: [0, 1]
 *                        default: 1
 *     responses:
 *       201:
 *         description: Customer created successfully
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
 * /api/v1/inventory/customers/{id}:
 *   put:
 *     summary: Update customer and their addresses
 *     tags: [Customers]
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
 *               CustomerName:
 *                  type: string
 *               LegalName:
 *                  type: string
 *               GSTIN:
 *                  type: string
 *               PAN:
 *                  type: string
 *               IsGSTRegistered:
 *                  type: integer
 *                  enum: [0, 1]
 *               MobileNo:
 *                  type: string
 *               Email:
 *                  type: string
 *               CustomerType:
 *                  type: string
 *               IsActive:
 *                  type: integer
 *                  enum: [0, 1]
 *               updated_by:
 *                  type: integer
 *               Addresses:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      AddressType:
 *                        type: string
 *                      AddressLine1:
 *                        type: string
 *                      AddressLine2:
 *                        type: string
 *                      CountryId:
 *                        type: integer
 *                      StateId:
 *                        type: integer
 *                      DistrictId:
 *                        type: integer
 *                      CityId:
 *                        type: integer
 *                      Pincode:
 *                        type: string
 *                      GSTIN:
 *                        type: string
 *                      PAN:
 *                        type: string
 *                      ContactPerson:
 *                        type: string
 *                      MobileNo:
 *                        type: string
 *                      WhatsAppNo:
 *                        type: string
 *                      RMN:
 *                        type: string
 *                      Email:
 *                        type: string
 *                      BankName:
 *                        type: string
 *                      AccountNumber:
 *                        type: string
 *                      IFSCCode:
 *                        type: string
 *                      BranchName:
 *                        type: string
 *                      IsDefault:
 *                        type: integer
 *                        enum: [0, 1]
 *                      IsActive:
 *                        type: integer
 *                        enum: [0, 1]
 *     responses:
 *       200:
 *         description: Customer updated successfully
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
 * /api/v1/inventory/customers/{id}:
 *   delete:
 *     summary: Delete customer (Soft)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               updated_by:
 *                  type: integer
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', remove);

module.exports = router;
