import { Request, Response } from "express";
import { OrdersService } from "../services/OrdersService";
import { AuditService } from "../services/AuditService";
import { OrderStatusEnum } from "../entity/orders.entity";

export class OrdersController {
    /**
     * List orders by company with filters
     */
    static async getOrdersByCompany(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            if (page < 1 || limit < 1) return res.status(400).json({ message: "Invalid pagination parameters" });

            const filters = {
                order_status: req.query.status ? Number(req.query.status) : undefined,
                cust_id: req.query.cust_id ? Number(req.query.cust_id) : undefined,
                from: req.query.from ? String(req.query.from) : undefined,
                to: req.query.to ? String(req.query.to) : undefined,
            };

            const offset = (page - 1) * limit;
            const { data, total } = await OrdersService.getOrdersByCompanyId(company_id, offset, limit, filters);

            const totalPages = Math.ceil(total / limit);
            return res.json({
                code: 200,
                message: 'Orders found',
                recordsTotal: total,
                recordsFiltered: data.length,
                data,
                currentPage: page,
                totalPages,
                perPage: limit
            });
        } catch (e) {
            console.error('OrdersController.getOrdersByCompany catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.message ?? e });
        }
    }

    /**
     * Get an order with items
     */
    static async getOrderById(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const order_id = parseInt(req.params.id, 10);
            if (!order_id) return res.status(400).json({ message: "Order ID is required" });

            const order = await OrdersService.findOrderById(order_id);
            if (!order || order.company_id !== company_id) {
                return res.status(404).json({ message: "Order not found" });
            }

            return res.json({ message: 'Order found', data: order });
        } catch (e) {
            console.error('OrdersController.getOrderById catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.message ?? e });
        }
    }

    /**
     * Create an order (draft)
     */
    static async create(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const user_id = req['user']?.user_id ?? 0;
            const { cust_id, id_inv_storage, order_date, order_notes, items } = req.body;

            const order = await OrdersService.create(company_id, user_id, {
                cust_id,
                id_inv_storage,
                order_date,
                order_notes,
                items
            });

            await AuditService.log({
                company_id,
                entity_type: 'orders',
                entity_id: order.order_id,
                action_type: 'CREATE',
                after: { order_code: order.order_code, cust_id: order.cust_id, total_local: order.total_local, total_stable: order.total_stable },
                changed_by: user_id || null,
                ip_address: req.ip
            });

            return res.status(201).json({ message: "Order created", data: order });
        } catch (e) {
            console.error('OrdersController.create catch error: ', e);
            return res.status(400).json({ message: e?.message ?? 'Error creating order' });
        }
    }

    /**
     * Update an order (draft only)
     */
    static async update(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const order_id = parseInt(req.params.id, 10);
            if (!order_id) return res.status(400).json({ message: "Order ID is required" });

            const order = await OrdersService.findOrderById(order_id);
            if (!order || order.company_id !== company_id) {
                return res.status(404).json({ message: "Order not found" });
            }

            const user_id = req['user']?.user_id ?? 0;
            const before = { cust_id: order.cust_id, id_inv_storage: order.id_inv_storage, order_notes: order.order_notes, total_local: order.total_local };

            const updated = await OrdersService.update(order, user_id, req.body);

            await AuditService.log({
                company_id,
                entity_type: 'orders',
                entity_id: order.order_id,
                action_type: 'UPDATE',
                before,
                after: { cust_id: updated.cust_id, id_inv_storage: updated.id_inv_storage, order_notes: updated.order_notes, total_local: updated.total_local },
                changed_by: user_id || null,
                ip_address: req.ip
            });

            return res.json({ message: "Order updated", data: updated });
        } catch (e) {
            console.error('OrdersController.update catch error: ', e);
            const status = e?.message?.includes('Only draft') ? 409 : 400;
            return res.status(status).json({ message: e?.message ?? 'Error updating order' });
        }
    }

    /**
     * Change order status (state machine)
     */
    static async changeStatus(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const order_id = parseInt(req.params.id, 10);
            if (!order_id) return res.status(400).json({ message: "Order ID is required" });

            const status = Number(req.body.status);
            if (!Object.values(OrderStatusEnum).includes(status)) {
                return res.status(400).json({ message: "Invalid status" });
            }

            const order = await OrdersService.findOrderById(order_id);
            if (!order || order.company_id !== company_id) {
                return res.status(404).json({ message: "Order not found" });
            }

            const user_id = req['user']?.user_id ?? 0;
            const updated = await OrdersService.changeStatus(order, status, user_id, req.ip);

            return res.json({ message: "Order status updated", data: updated });
        } catch (e) {
            console.error('OrdersController.changeStatus catch error: ', e);
            const status = e?.message?.includes('Invalid status transition') ? 409 : 400;
            return res.status(status).json({ message: e?.message ?? 'Error changing order status' });
        }
    }

    /**
     * Delete an order (draft only)
     */
    static async delete(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const order_id = parseInt(req.params.id, 10);
            if (!order_id) return res.status(400).json({ message: "Order ID is required" });

            const order = await OrdersService.findOrderById(order_id);
            if (!order || order.company_id !== company_id) {
                return res.status(404).json({ message: "Order not found" });
            }

            const user_id = req['user']?.user_id ?? 0;
            const response = await OrdersService.delete(order);

            await AuditService.log({
                company_id,
                entity_type: 'orders',
                entity_id: order_id,
                action_type: 'DELETE',
                before: { order_code: order.order_code, cust_id: order.cust_id },
                changed_by: user_id || null,
                ip_address: req.ip
            });

            return res.json(response);
        } catch (e) {
            console.error('OrdersController.delete catch error: ', e);
            const status = e?.message?.includes('Only draft') ? 409 : 400;
            return res.status(status).json({ message: e?.message ?? 'Error deleting order' });
        }
    }
}
