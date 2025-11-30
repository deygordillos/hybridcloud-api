import bcrypt from "bcrypt";
import messages from "../config/messages";
import { Users } from "../entity/users.entity";
import { UserRepository } from "../repositories/UserRepository";
import { UserAuditRepository } from "../repositories/UserAuditRepository";
import { UsersCompaniesRepository } from "../repositories/UsersCompaniesRepository";

export class UserService {
    /**
     * Lista usuarios con paginación y filtro por empresa
     * @param offset Offset para paginación
     * @param limit Límite de registros
     * @param company_id ID de la empresa (opcional si isAdmin es true)
     * @param user_status Filtro opcional por estado (1=activo, 0=inactivo)
     * @param user_type Filtro opcional por tipo de usuario
     * @param current_user Usuario actual (para verificar permisos)
     */
    static async list(
        offset: number = 0, 
        limit: number = 10, 
        company_id?: number,
        user_status?: number, 
        user_type?: number,
        current_user?: any
    ) {
        // Si es admin y no se especifica company_id, listar todos los usuarios
        if (current_user?.is_admin && !company_id) {
            const queryBuilder = UserRepository.createQueryBuilder("user")
                .select([
                    "user.user_id",
                    "user.username",
                    "user.user_type",
                    "user.user_status",
                    "user.email",
                    "user.first_name",
                    "user.last_name",
                    "user.user_phone",
                    "user.is_admin",
                    "user.created_at",
                    "user.updated_at",
                    "user.last_login"
                ]);

            if (user_status !== undefined) {
                queryBuilder.andWhere("user.user_status = :user_status", { user_status });
            }

            if (user_type !== undefined) {
                queryBuilder.andWhere("user.user_type = :user_type", { user_type });
            }
            queryBuilder.andWhere("user.user_id != :user_id", { user_id: current_user?.user_id });

            queryBuilder
                .orderBy("user.created_at", "DESC")
                .offset(offset)
                .limit(limit);

            const [data, total] = await queryBuilder.getManyAndCount();

            return { data, total };
        }

        // Query para obtener usuarios de la empresa
        const queryBuilder = UsersCompaniesRepository.createQueryBuilder("uc")
            .innerJoin("uc.user_id", "user")
            .where("uc.company_id = :company_id", { company_id })
            .select([
                "user.user_id as user_id",
                "user.username as username",
                "user.user_type as user_type",
                "user.user_status as user_status",
                "user.email as email",
                "user.first_name as first_name",
                "user.last_name as last_name",
                "user.user_phone as user_phone",
                "user.is_admin as is_admin",
                "user.created_at as created_at",
                "user.updated_at as updated_at",
                "user.last_login as last_login",
                "uc.is_company_admin as is_company_admin",
                "uc.created_at as assigned_at"
            ]);

        if (user_status !== undefined) {
            queryBuilder.andWhere("user.user_status = :user_status", { user_status });
        }

        if (user_type !== undefined) {
            queryBuilder.andWhere("user.user_type = :user_type", { user_type });
        }

        queryBuilder
            .orderBy("user.created_at", "DESC")
            .offset(offset)
            .limit(limit);

        const data = await queryBuilder.getRawMany();

        // Contar total de usuarios de la empresa
        const countQueryBuilder = UsersCompaniesRepository.createQueryBuilder("uc")
            .innerJoin("uc.user_id", "user")
            .where("uc.company_id = :company_id", { company_id });

        if (user_status !== undefined) {
            countQueryBuilder.andWhere("user.user_status = :user_status", { user_status });
        }

        if (user_type !== undefined) {
            countQueryBuilder.andWhere("user.user_type = :user_type", { user_type });
        }

        const total = await countQueryBuilder.getCount();

        return { data, total };
    }

    /**
     * Busca un usuario por ID
     * @param user_id ID del usuario
     */
    static async findById(user_id: number) {
        const user = await UserRepository.createQueryBuilder("user")
            .select([
                "user.user_id",
                "user.username",
                "user.user_type",
                "user.user_status",
                "user.email",
                "user.first_name",
                "user.last_name",
                "user.user_phone",
                "user.is_admin",
                "user.created_at",
                "user.updated_at",
                "user.last_login"
            ])
            .where("user.user_id = :user_id", { user_id })
            .getOne();

        if (!user) {
            throw new Error(messages.User.user_not_exists || "User not found.");
        }

        return user;
    }

    /**
     * Busca un usuario por username
     * @param username Username del usuario
     */
    static async findByUsername(username: string) {
        return await UserRepository.findOne({
            where: { username },
            select: [
                "user_id",
                "username",
                "user_type",
                "user_status",
                "email",
                "first_name",
                "last_name",
                "user_phone",
                "is_admin",
                "created_at",
                "updated_at",
                "last_login"
            ]
        });
    }

    /**
     * Busca un usuario por email
     * @param email Email del usuario
     */
    static async findByEmail(email: string) {
        return await UserRepository.findOne({
            where: { email },
            select: [
                "user_id",
                "username",
                "user_type",
                "user_status",
                "email",
                "first_name",
                "last_name",
                "user_phone",
                "is_admin",
                "created_at",
                "updated_at",
                "last_login"
            ]
        });
    }

    /**
     * Crea un nuevo usuario
     * @param userData Datos del usuario
     * @param createdBy Usuario que crea el registro
     * @param ipAddress IP desde donde se crea
     */
    static async create(
        userData: {
            username: string;
            password: string;
            user_type: number;
            email: string;
            first_name: string;
            last_name?: string;
            user_phone?: string;
            is_admin?: number;
        },
        createdBy: Users,
        ipAddress?: string
    ) {
        // Verificar si el username ya existe
        const existingUsername = await UserRepository.findOneBy({ username: userData.username });
        if (existingUsername) {
            throw new Error(messages.User.user_exists || "Username already exists.");
        }

        // Verificar si el email ya existe
        const existingEmail = await UserRepository.findOneBy({ email: userData.email });
        if (existingEmail) {
            throw new Error(messages.User.email_exists || "Email already exists.");
        }

        // Hash del password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Crear usuario
        const user = UserRepository.create({
            username: userData.username,
            password: hashedPassword,
            user_type: userData.user_type,
            email: userData.email,
            first_name: userData.first_name,
            last_name: userData.last_name,
            user_phone: userData.user_phone,
            is_admin: userData.is_admin || 0,
            user_status: 1,
            created_at: new Date(),
            updated_at: new Date()
        });

        await UserRepository.save(user);

        // Registrar auditoría
        await this.createAuditLog(
            user,
            'CREATE',
            createdBy,
            {
                username: userData.username,
                user_type: userData.user_type,
                email: userData.email,
                first_name: userData.first_name,
                last_name: userData.last_name,
                is_admin: userData.is_admin || 0
            },
            ipAddress
        );

        return user;
    }

    /**
     * Actualiza un usuario existente
     * @param user Usuario a actualizar
     * @param updateData Datos a actualizar
     * @param updatedBy Usuario que realiza la actualización
     * @param ipAddress IP desde donde se actualiza
     */
    static async update(
        user: Users,
        updateData: {
            email?: string;
            first_name?: string;
            last_name?: string;
            user_phone?: string;
            user_type?: number;
            is_admin?: number;
        },
        updatedBy: Users,
        ipAddress?: string
    ) {
        const changes: any = {};

        // Verificar email duplicado
        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await UserRepository.findOneBy({ email: updateData.email });
            if (existingEmail && existingEmail.user_id !== user.user_id) {
                throw new Error(messages.User.email_exists || "Email already exists.");
            }
            changes.email = { old: user.email, new: updateData.email };
            user.email = updateData.email;
        }

        // Actualizar otros campos
        if (updateData.first_name && updateData.first_name !== user.first_name) {
            changes.first_name = { old: user.first_name, new: updateData.first_name };
            user.first_name = updateData.first_name;
        }

        if (updateData.last_name !== undefined && updateData.last_name !== user.last_name) {
            changes.last_name = { old: user.last_name, new: updateData.last_name };
            user.last_name = updateData.last_name;
        }

        if (updateData.user_phone !== undefined && updateData.user_phone !== user.user_phone) {
            changes.user_phone = { old: user.user_phone, new: updateData.user_phone };
            user.user_phone = updateData.user_phone;
        }

        if (updateData.user_type !== undefined && updateData.user_type !== user.user_type) {
            changes.user_type = { old: user.user_type, new: updateData.user_type };
            user.user_type = updateData.user_type;
        }

        if (updateData.is_admin !== undefined && updateData.is_admin !== user.is_admin) {
            changes.is_admin = { old: user.is_admin, new: updateData.is_admin };
            user.is_admin = updateData.is_admin;
        }

        user.updated_at = new Date();

        await UserRepository.save(user);

        // Registrar auditoría solo si hubo cambios
        if (Object.keys(changes).length > 0) {
            await this.createAuditLog(user, 'UPDATE', updatedBy, changes, ipAddress);
        }

        return user;
    }

    /**
     * Desactiva un usuario (no elimina)
     * @param user Usuario a desactivar
     * @param deactivatedBy Usuario que desactiva
     * @param ipAddress IP desde donde se desactiva
     */
    static async deactivate(user: Users, deactivatedBy: Users, ipAddress?: string) {
        if (user.user_status === 0) {
            throw new Error(messages.User.user_already_inactive || "User is already inactive.");
        }

        user.user_status = 0;
        user.updated_at = new Date();

        await UserRepository.save(user);

        // Registrar auditoría
        await this.createAuditLog(
            user,
            'DEACTIVATE',
            deactivatedBy,
            { user_status: { old: 1, new: 0 } },
            ipAddress
        );

        return user;
    }

    /**
     * Activa un usuario
     * @param user Usuario a activar
     * @param activatedBy Usuario que activa
     * @param ipAddress IP desde donde se activa
     */
    static async activate(user: Users, activatedBy: Users, ipAddress?: string) {
        if (user.user_status === 1) {
            throw new Error(messages.User.user_already_active || "User is already active.");
        }

        user.user_status = 1;
        user.updated_at = new Date();

        await UserRepository.save(user);

        // Registrar auditoría
        await this.createAuditLog(
            user,
            'ACTIVATE',
            activatedBy,
            { user_status: { old: 0, new: 1 } },
            ipAddress
        );

        return user;
    }

    /**
     * Cambia la contraseña de un usuario
     * @param user Usuario
     * @param newPassword Nueva contraseña
     * @param changedBy Usuario que realiza el cambio
     * @param ipAddress IP desde donde se cambia
     */
    static async changePassword(user: Users, newPassword: string, changedBy: Users, ipAddress?: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.updated_at = new Date();

        await UserRepository.save(user);

        // Registrar auditoría
        await this.createAuditLog(
            user,
            'PASSWORD_CHANGE',
            changedBy,
            { action: 'Password changed' },
            ipAddress
        );

        return user;
    }

    /**
     * Obtiene el historial de auditoría de un usuario
     * @param user_id ID del usuario
     * @param offset Offset para paginación
     * @param limit Límite de registros
     */
    static async getAuditHistory(user_id: number, offset: number = 0, limit: number = 50) {
        const [data, total] = await UserAuditRepository.createQueryBuilder("audit")
            .leftJoinAndSelect("audit.user_id", "user")
            .leftJoinAndSelect("audit.changed_by", "changed_by")
            .where("audit.user_id = :user_id", { user_id })
            .select([
                "audit.audit_id",
                "audit.action_type",
                "audit.changes_data",
                "audit.ip_address",
                "audit.created_at",
                "user.user_id",
                "user.username",
                "changed_by.user_id",
                "changed_by.username",
                "changed_by.first_name",
                "changed_by.last_name"
            ])
            .orderBy("audit.created_at", "DESC")
            .skip(offset)
            .take(limit)
            .getManyAndCount();

        return { data, total };
    }

    /**
     * Crea un registro de auditoría
     * @param user Usuario afectado
     * @param action Acción realizada
     * @param changedBy Usuario que realiza el cambio
     * @param changes Datos del cambio
     * @param ipAddress IP desde donde se realiza
     */
    private static async createAuditLog(
        user: Users,
        action: string,
        changedBy: Users,
        changes: object,
        ipAddress?: string
    ) {
        const audit = UserAuditRepository.create({
            user_id: user,
            action_type: action,
            changed_by: changedBy,
            changes_data: changes,
            ip_address: ipAddress || null,
            created_at: new Date()
        });

        await UserAuditRepository.save(audit);
    }
}
