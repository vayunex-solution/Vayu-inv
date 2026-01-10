/**
 * Item Swagger Definitions
 * Additional schema definitions for items
 * 
 * @swagger
 * components:
 *   schemas:
 *     Item:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         item_code:
 *           type: string
 *           example: ITM001
 *         item_name:
 *           type: string
 *           example: Sample Item
 *         description:
 *           type: string
 *           example: Item description
 *         category_id:
 *           type: integer
 *           example: 1
 *         category_name:
 *           type: string
 *           example: General
 *         unit:
 *           type: string
 *           example: PCS
 *         unit_price:
 *           type: number
 *           format: float
 *           example: 100.50
 *         quantity:
 *           type: number
 *           example: 50
 *         reorder_level:
 *           type: number
 *           example: 10
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           example: active
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     ItemCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: General
 *         description:
 *           type: string
 *           example: General items
 */

module.exports = {};
