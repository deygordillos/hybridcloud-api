import { Request, Response } from "express";
import { DashboardService } from "../services/DashboardService";

export class DashboardController {
    static async summary(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const from = req.query.from ? String(req.query.from) : undefined;
            const to = req.query.to ? String(req.query.to) : undefined;

            const data = await DashboardService.getSummary(company_id, from, to);
            return res.json({ message: 'Dashboard summary', data });
        } catch (e) {
            console.error('DashboardController.summary catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.message ?? e });
        }
    }

    static async sales(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const from = req.query.from ? String(req.query.from) : undefined;
            const to = req.query.to ? String(req.query.to) : undefined;
            const groupBy = ['day', 'week', 'month'].includes(String(req.query.group_by))
                ? String(req.query.group_by) as 'day' | 'week' | 'month'
                : 'day';

            const data = await DashboardService.getSalesSeries(company_id, from, to, groupBy);
            return res.json({ message: 'Sales series', data });
        } catch (e) {
            console.error('DashboardController.sales catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.message ?? e });
        }
    }

    static async topProducts(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const from = req.query.from ? String(req.query.from) : undefined;
            const to = req.query.to ? String(req.query.to) : undefined;
            const limit = Number(req.query.limit) || 10;

            const data = await DashboardService.getTopProducts(company_id, from, to, limit);
            return res.json({ message: 'Top products', data });
        } catch (e) {
            console.error('DashboardController.topProducts catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.message ?? e });
        }
    }

    static async lowStock(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const threshold = req.query.threshold !== undefined ? Number(req.query.threshold) : undefined;

            const data = await DashboardService.getLowStock(company_id, threshold);
            return res.json({ message: 'Low stock', data });
        } catch (e) {
            console.error('DashboardController.lowStock catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.message ?? e });
        }
    }

    static async exchangeRate(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const days = Number(req.query.days) || 30;
            const type = Number(req.query.type) || 2;

            const data = await DashboardService.getExchangeRateSeries(company_id, days, type);
            return res.json({ message: 'Exchange rate series', data });
        } catch (e) {
            console.error('DashboardController.exchangeRate catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.message ?? e });
        }
    }

    static async recentActivity(req: Request, res: Response) {
        try {
            const company_id = req['company_id'] || false;
            if (!company_id) return res.status(400).json({ message: "Company ID is required" });

            const limit = Number(req.query.limit) || 10;

            const data = await DashboardService.getRecentActivity(company_id, limit);
            return res.json({ message: 'Recent activity', data });
        } catch (e) {
            console.error('DashboardController.recentActivity catch error: ', e);
            return res.status(500).json({ message: 'error', data: e?.message ?? e });
        }
    }
}
