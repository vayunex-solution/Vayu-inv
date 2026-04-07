/**
 * Item Category Controller & Routes
 * Full CRUD for Item Category Master
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../core/auth');
const logger = require('../../../core/logger');

// ────────────────────────────────────────────────────────
// Demo data fallback (used when DB procedure not found)
// ────────────────────────────────────────────────────────
let demoCategories = [
    { id: 1, name: 'General',       description: 'General items',                 parent_id: null, is_active: 1 },
    { id: 2, name: 'Electronics',   description: 'Electronic items',              parent_id: null, is_active: 1 },
    { id: 3, name: 'Consumables',   description: 'Consumable items',              parent_id: null, is_active: 1 },
    { id: 4, name: 'Raw Materials', description: 'Raw materials for production',  parent_id: null, is_active: 1 },
    { id: 5, name: 'Finished Goods', description: 'Ready for sale items',         parent_id: null, is_active: 1 },
];
let nextId = 6;

const { callProcedure } = (() => {
    try { return require('../../../core/database'); }
    catch { return { callProcedure: null }; }
})();

const tryProcedure = async (name, params) => {
    if (!callProcedure) throw new Error('procedure not found');
    return callProcedure(name, params);
};

const isProcError = (e) => {
    const m = (e.message || '').toLowerCase();
    return m.includes('procedure') || m.includes('not found') || e.code === 'ER_SP_DOES_NOT_EXIST';
};

// ────────────────────────────────────────────────────────
// GET  /   — get all categories
// ────────────────────────────────────────────────────────
const getAll = async (req, res) => {
    try {
        const { search = '' } = req.query;
        const result = await tryProcedure('sp_get_item_categories', { search });
        return res.json(result.data || []);
    } catch (e) {
        if (isProcError(e)) {
            logger.warn('sp_get_item_categories missing — demo fallback');
            const s = req.query.search?.toLowerCase() || '';
            const data = s
                ? demoCategories.filter(c => c.name.toLowerCase().includes(s) || (c.description || '').toLowerCase().includes(s))
                : demoCategories;
            return res.json(data);
        }
        logger.error('getAll categories error', e);
        res.status(500).json({ message: e.message });
    }
};

// ────────────────────────────────────────────────────────
// GET  /:id — get single category
// ────────────────────────────────────────────────────────
const getById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await tryProcedure('sp_get_item_category_by_id', { id });
        if (!result.data || result.data.length === 0) return res.status(404).json({ message: 'Category not found' });
        return res.json(result.data[0]);
    } catch (e) {
        if (isProcError(e)) {
            const found = demoCategories.find(c => c.id === id);
            if (!found) return res.status(404).json({ message: 'Category not found' });
            return res.json(found);
        }
        res.status(500).json({ message: e.message });
    }
};

// ────────────────────────────────────────────────────────
// POST /  — create category
// ────────────────────────────────────────────────────────
const create = async (req, res) => {
    const { name, description, parent_id } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Category name is required' });

    try {
        const result = await tryProcedure('sp_create_item_category', { name, description, parent_id: parent_id || null });
        return res.status(201).json(result.data || { id: nextId, name, description, parent_id, is_active: 1 });
    } catch (e) {
        if (isProcError(e)) {
            const newCat = { id: nextId++, name: name.trim(), description: description || null, parent_id: parent_id || null, is_active: 1 };
            demoCategories.push(newCat);
            logger.info('Demo category created', newCat);
            return res.status(201).json(newCat);
        }
        res.status(400).json({ message: e.message });
    }
};

// ────────────────────────────────────────────────────────
// PUT  /:id — update category
// ────────────────────────────────────────────────────────
const update = async (req, res) => {
    const id = parseInt(req.params.id);
    const { name, description, parent_id, is_active } = req.body;

    try {
        const result = await tryProcedure('sp_update_item_category', { id, name, description, parent_id, is_active });
        return res.json(result.data || { id, name, description, parent_id, is_active, updated_at: new Date() });
    } catch (e) {
        if (isProcError(e)) {
            const idx = demoCategories.findIndex(c => c.id === id);
            if (idx === -1) return res.status(404).json({ message: 'Category not found' });
            if (name) demoCategories[idx].name = name;
            if (description !== undefined) demoCategories[idx].description = description;
            if (is_active !== undefined) demoCategories[idx].is_active = is_active;
            return res.json(demoCategories[idx]);
        }
        res.status(400).json({ message: e.message });
    }
};

// ────────────────────────────────────────────────────────
// DELETE /:id — soft delete category
// ────────────────────────────────────────────────────────
const remove = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await tryProcedure('sp_delete_item_category', { id });
        return res.json({ success: true, message: 'Category deleted' });
    } catch (e) {
        if (isProcError(e)) {
            const idx = demoCategories.findIndex(c => c.id === id);
            if (idx === -1) return res.status(404).json({ message: 'Category not found' });
            demoCategories[idx].is_active = 0;
            return res.json({ success: true, message: 'Category deleted' });
        }
        res.status(400).json({ message: e.message });
    }
};

// ────────────────────────────────────────────────────────
// Route Registration
// ────────────────────────────────────────────────────────
router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: ItemCategories
 *   description: Item category management
 *
 * /api/v1/inventory/item-categories:
 *   get:
 *     summary: Get all item categories
 *     tags: [ItemCategories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *   post:
 *     summary: Create new item category
 *     tags: [ItemCategories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               parent_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Category created successfully
 *
 * /api/v1/inventory/item-categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     tags: [ItemCategories]
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
 *         description: Category details
 *   put:
 *     summary: Update category
 *     tags: [ItemCategories]
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
 *         description: Category updated
 *   delete:
 *     summary: Delete category (Soft)
 *     tags: [ItemCategories]
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
 *         description: Category deleted
 */
router.get('/', getAll);
router.get('/:id', getById);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
