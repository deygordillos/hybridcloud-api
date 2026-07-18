import { Router } from 'express'
import { body, param, query } from "express-validator";
import { validatorRequestMiddleware } from '../../middlewares/validator_request';
import { authMiddleware } from '../../middlewares/AuthMiddleware';
import { companyMiddleware } from '../../middlewares/companyMiddleware';
import { OrdersController } from '../../controllers/orders.controller';

const router = Router();

router.use(authMiddleware);
router.use(companyMiddleware);

/**
 * @swagger
 * /v1/orders:
 *   get:
 *     summary: Get orders for the company
 *     description: Retrieves paginated sales orders, filterable by status, customer and date range
 *     tags: [orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: status
 *         schema: { type: integer, enum: [1, 2, 3, 4, 5] }
 *         description: 1 draft, 2 confirmed, 3 dispatched, 4 invoiced, 5 cancelled
 *       - in: query
 *         name: cust_id
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/',
    [
        query('page').optional().isInt({ min: 1 }),
        query('limit').optional().isInt({ min: 1 }),
        query('status').optional().isInt({ min: 1, max: 5 }),
        query('cust_id').optional().isInt({ min: 1 }),
        query('from').optional().isISO8601(),
        query('to').optional().isISO8601(),
        validatorRequestMiddleware
    ],
    OrdersController.getOrdersByCompany);

/**
 * @swagger
 * /v1/orders/{id}:
 *   get:
 *     summary: Get an order with its items
 *     tags: [orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order retrieved successfully
 *       404:
 *         description: Order not found
 */
router.get('/:id',
    [
        param('id').isInt({ min: 1 }).withMessage("Order ID must be a positive integer"),
        validatorRequestMiddleware
    ],
    OrdersController.getOrderById);

/**
 * @swagger
 * /v1/orders:
 *   post:
 *     summary: Create a sales order (draft)
 *     description: Creates a draft sales order with items. Prices and exchange rates are snapshotted.
 *     tags: [orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cust_id, items]
 *             properties:
 *               cust_id:
 *                 type: integer
 *               id_inv_storage:
 *                 type: integer
 *                 description: Dispatch storage
 *               order_date:
 *                 type: string
 *                 format: date
 *               order_notes:
 *                 type: string
 *                 maxLength: 500
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [inv_var_id, quantity]
 *                   properties:
 *                     inv_var_id: { type: integer }
 *                     inv_price_id: { type: integer, description: "Source price for traceability; its base price is used if no explicit prices sent" }
 *                     quantity: { type: number, minimum: 0.001 }
 *                     discount_percent: { type: number, minimum: 0, maximum: 100 }
 *                     price_unit_local: { type: number }
 *                     price_unit_stable: { type: number }
 *                     price_unit_ref: { type: number }
 *                     item_notes: { type: string, maxLength: 255 }
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Validation error
 */
router.post('/',
    [
        body('cust_id').notEmpty().isInt({ min: 1 }).withMessage("cust_id is required"),
        body('id_inv_storage').optional({ nullable: true }).isInt({ min: 1 }),
        body('order_date').optional().isISO8601(),
        body('order_notes').optional({ nullable: true }).isString().isLength({ max: 500 }),
        body('items').isArray({ min: 1 }).withMessage("items must be a non-empty array"),
        body('items.*.inv_var_id').notEmpty().isInt({ min: 1 }),
        body('items.*.quantity').notEmpty().isFloat({ gt: 0 }),
        body('items.*.inv_price_id').optional({ nullable: true }).isInt({ min: 1 }),
        body('items.*.discount_percent').optional().isFloat({ min: 0, max: 100 }),
        body('items.*.price_unit_local').optional().isFloat({ min: 0 }),
        body('items.*.price_unit_stable').optional().isFloat({ min: 0 }),
        body('items.*.price_unit_ref').optional().isFloat({ min: 0 }),
        validatorRequestMiddleware
    ],
    OrdersController.create);

/**
 * @swagger
 * /v1/orders/{id}:
 *   put:
 *     summary: Update a draft order
 *     description: Updates order data and replaces its items. Only draft orders can be updated.
 *     tags: [orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order updated
 *       409:
 *         description: Order is not in draft status
 */
router.put('/:id',
    [
        param('id').isInt({ min: 1 }),
        body('cust_id').optional().isInt({ min: 1 }),
        body('id_inv_storage').optional({ nullable: true }).isInt({ min: 1 }),
        body('order_date').optional().isISO8601(),
        body('order_notes').optional({ nullable: true }).isString().isLength({ max: 500 }),
        body('items').optional().isArray({ min: 1 }),
        body('items.*.inv_var_id').optional().isInt({ min: 1 }),
        body('items.*.quantity').optional().isFloat({ gt: 0 }),
        validatorRequestMiddleware
    ],
    OrdersController.update);

/**
 * @swagger
 * /v1/orders/{id}/status:
 *   post:
 *     summary: Change order status
 *     description: "State machine: 1 draft -> 2 confirmed -> 3 dispatched -> 4 invoiced. Cancel (5) from draft/confirmed. Confirming re-snapshots exchange rates; dispatching creates inventory movements."
 *     tags: [orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: integer
 *                 enum: [2, 3, 4, 5]
 *     responses:
 *       200:
 *         description: Status updated
 *       409:
 *         description: Invalid transition
 */
router.post('/:id/status',
    [
        param('id').isInt({ min: 1 }),
        body('status').notEmpty().isInt({ min: 1, max: 5 }).withMessage("status must be between 1 and 5"),
        validatorRequestMiddleware
    ],
    OrdersController.changeStatus);

/**
 * @swagger
 * /v1/orders/{id}:
 *   delete:
 *     summary: Delete a draft order
 *     tags: [orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order deleted
 *       409:
 *         description: Order is not in draft status
 */
router.delete('/:id',
    [
        param('id').isInt({ min: 1 }),
        validatorRequestMiddleware
    ],
    OrdersController.delete);

export default router
