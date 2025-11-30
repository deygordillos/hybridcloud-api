import { Request, Response } from "express";
import messages from "../config/messages";
import { UserService } from "../services/UserService";
import { successResponse, errorResponse } from "../helpers/responseHelper";

export class UsersController {
    /**
     * Lista todos los usuarios con paginación filtrados por empresa
     */
    static async list(req: Request, res: Response): Promise<Response> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const user_status = req.query.user_status !== undefined ? parseInt(req.query.user_status as string) : undefined;
            const user_type = req.query.user_type !== undefined ? parseInt(req.query.user_type as string) : undefined;

            // Obtener company_id del request (viene del companyMiddleware o del header)
            let company_id = req['company_id'];
            
            // Si no viene por middleware, verificar en headers
            if (!company_id) {
                const companyIdHeader = req.headers['x-company-id'];
                if (companyIdHeader) {
                    company_id = parseInt(companyIdHeader as string);
                }
            }

            // Si aún no hay company_id, retornar error
            if (!company_id) {
                return errorResponse(res, "Company ID is required", 400);
            }

            const offset = (page - 1) * limit;

            const { data, total } = await UserService.list(offset, limit, company_id, user_status, user_type);

            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: Math.ceil(total / limit)
            };

            return successResponse(res, "Users retrieved successfully", 200, data, pagination);
        } catch (error: any) {
            console.error('UsersController.list error:', error);
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Obtiene un usuario por ID
     */
    static async getById(req: Request, res: Response): Promise<Response> {
        try {
            const user_id = parseInt(req.params.id);

            if (!user_id || isNaN(user_id)) {
                return errorResponse(res, messages.User.user_needed, 400);
            }

            const user = await UserService.findById(user_id);

            return successResponse(res, "User retrieved successfully", 200, user);
        } catch (error: any) {
            console.error('UsersController.getById error:', error);
            if (error.message === messages.User.user_not_exists) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Crea un nuevo usuario
     */
    static async create(req: Request, res: Response): Promise<Response> {
        try {
            const {
                username,
                password,
                user_type,
                email,
                first_name,
                last_name,
                user_phone,
                is_admin
            } = req.body;

            const currentUser = (req as any).user;
            const ipAddress = req.ip || req.socket.remoteAddress;

            const user = await UserService.create(
                {
                    username,
                    password,
                    user_type,
                    email,
                    first_name,
                    last_name,
                    user_phone,
                    is_admin
                },
                currentUser,
                ipAddress
            );

            // Remover el password de la respuesta
            const { password: _, ...userWithoutPassword } = user as any;

            return successResponse(res, messages.User.user_created, 201, userWithoutPassword);
        } catch (error: any) {
            console.error('UsersController.create error:', error);
            if (error.message === messages.User.user_exists || error.message === messages.User.email_exists) {
                return errorResponse(res, error.message, 400);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Actualiza un usuario existente
     */
    static async update(req: Request, res: Response): Promise<Response> {
        try {
            const user_id = parseInt(req.params.id);

            if (!user_id || isNaN(user_id)) {
                return errorResponse(res, messages.User.user_needed, 400);
            }

            const {
                email,
                first_name,
                last_name,
                user_phone,
                user_type,
                is_admin
            } = req.body;

            const currentUser = (req as any).user;
            const ipAddress = req.ip || req.socket.remoteAddress;

            const user = await UserService.findById(user_id);

            const updatedUser = await UserService.update(
                user,
                {
                    email,
                    first_name,
                    last_name,
                    user_phone,
                    user_type,
                    is_admin
                },
                currentUser,
                ipAddress
            );

            // Remover el password de la respuesta
            const { password: _, ...userWithoutPassword } = updatedUser as any;

            return successResponse(res, messages.User.user_updated, 200, userWithoutPassword);
        } catch (error: any) {
            console.error('UsersController.update error:', error);
            if (error.message === messages.User.user_not_exists) {
                return errorResponse(res, error.message, 404);
            }
            if (error.message === messages.User.email_exists) {
                return errorResponse(res, error.message, 400);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Desactiva un usuario (no lo elimina)
     */
    static async deactivate(req: Request, res: Response): Promise<Response> {
        try {
            const user_id = parseInt(req.params.id);

            if (!user_id || isNaN(user_id)) {
                return errorResponse(res, messages.User.user_needed, 400);
            }

            const currentUser = (req as any).user;
            const ipAddress = req.ip || req.socket.remoteAddress;

            const user = await UserService.findById(user_id);

            await UserService.deactivate(user, currentUser, ipAddress);

            return successResponse(res, messages.User.user_deactivated, 200, null);
        } catch (error: any) {
            console.error('UsersController.deactivate error:', error);
            if (error.message === messages.User.user_not_exists) {
                return errorResponse(res, error.message, 404);
            }
            if (error.message === messages.User.user_already_inactive) {
                return errorResponse(res, error.message, 400);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Activa un usuario
     */
    static async activate(req: Request, res: Response): Promise<Response> {
        try {
            const user_id = parseInt(req.params.id);

            if (!user_id || isNaN(user_id)) {
                return errorResponse(res, messages.User.user_needed, 400);
            }

            const currentUser = (req as any).user;
            const ipAddress = req.ip || req.socket.remoteAddress;

            const user = await UserService.findById(user_id);

            await UserService.activate(user, currentUser, ipAddress);

            return successResponse(res, messages.User.user_activated, 200, null);
        } catch (error: any) {
            console.error('UsersController.activate error:', error);
            if (error.message === messages.User.user_not_exists) {
                return errorResponse(res, error.message, 404);
            }
            if (error.message === messages.User.user_already_active) {
                return errorResponse(res, error.message, 400);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Cambia la contraseña de un usuario
     */
    static async changePassword(req: Request, res: Response): Promise<Response> {
        try {
            const user_id = parseInt(req.params.id);

            if (!user_id || isNaN(user_id)) {
                return errorResponse(res, messages.User.user_needed, 400);
            }

            const { password } = req.body;

            const currentUser = (req as any).user;
            const ipAddress = req.ip || req.socket.remoteAddress;

            const user = await UserService.findById(user_id);

            await UserService.changePassword(user, password, currentUser, ipAddress);

            return successResponse(res, messages.User.password_changed, 200, null);
        } catch (error: any) {
            console.error('UsersController.changePassword error:', error);
            if (error.message === messages.User.user_not_exists) {
                return errorResponse(res, error.message, 404);
            }
            return errorResponse(res, error.message, 500);
        }
    }

    /**
     * Obtiene el historial de auditoría de un usuario
     */
    static async getAuditHistory(req: Request, res: Response): Promise<Response> {
        try {
            const user_id = parseInt(req.params.id);

            if (!user_id || isNaN(user_id)) {
                return errorResponse(res, messages.User.user_needed, 400);
            }

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 50;
            const offset = (page - 1) * limit;

            const { data, total } = await UserService.getAuditHistory(user_id, offset, limit);

            const pagination = {
                total,
                perPage: limit,
                currentPage: page,
                lastPage: Math.ceil(total / limit)
            };

            return successResponse(res, "Audit history retrieved successfully", 200, data, pagination);
        } catch (error: any) {
            console.error('UsersController.getAuditHistory error:', error);
            return errorResponse(res, error.message, 500);
        }
    }
}