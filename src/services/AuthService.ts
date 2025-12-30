import bcrypt from "bcryptjs";
import crypto from "crypto";
import { UserRepository } from "../repositories/UserRepository";
import config from "../config/config";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../config/jwt";
import messages from "../config/messages";
import { EmailService } from "./EmailService";

export class AuthService {
    static async registerAdmin(username: string, password: string, first_name: string, email: string) {
        const userFind = await UserRepository.findOne({ where: { username } });
        if (userFind) throw new Error(messages.User.user_exists);

        const hashedPassword = await bcrypt.hash(password, config.BCRYPT_SALT);
        const admin_user = UserRepository.create({ username, password: hashedPassword, first_name, email });
        await UserRepository.save(admin_user);
        return admin_user;
    }

    static async login(username: string, password: string, ip_address: string = null) {
        const user = await UserRepository.findOne({ where: { username } });
        if (!user || !(await user.validarPassword(password))) {
            throw new Error(messages.Auth.user_auth_incorrect);
        }
        if (user.user_status !== 1) throw new Error(messages.Auth.user_not_found);

        const access_token = generateToken(user);
        const refresh_token = generateRefreshToken(user);
        user.last_login = new Date();
        user.ip_address = ip_address;
        user.access_token = access_token;
        user.refresh_token = refresh_token;
        await UserRepository.save(user);

        delete user.password;
        delete user.access_token;
        delete user.refresh_token;
        return { access_token, refresh_token, data: user };
    }

    static async refreshLogin(refreshToken: string) {
        try {
            const userToken = verifyRefreshToken(refreshToken);

            const user = await UserRepository.findOne({ where: { user_id: userToken.user_id } });
            if (user.user_status !== 1) throw new Error(messages.Auth.user_not_found);

            const access_token  = generateToken(user);
            const refresh_token = generateRefreshToken(user);

            delete user.password;
            delete user.access_token;
            delete user.refresh_token;
            return { access_token, refresh_token, data: user };
        } catch (error) {
            return { error: "Token inválido" }
        }
    }

    /**
     * Solicita un reset de contraseña generando un token y guardándolo
     * @param email Email del usuario
     * @returns Mensaje de éxito
     */
    static async requestPasswordReset(email: string) {
        const user = await UserRepository.findOne({ 
            where: { email },
            select: ['user_id', 'username', 'email', 'user_status', 'reset_password_token', 'reset_password_expires']
        });
        
        if (!user) {
            throw new Error(messages.Auth.user_email_not_found);
        }

        if (user.user_status !== 1) {
            throw new Error(messages.Auth.user_not_found);
        }

        // Generar token aleatorio
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = await bcrypt.hash(resetToken, 10);

        // Guardar token hasheado y fecha de expiración (1 hora)
        user.reset_password_token = hashedToken;
        user.reset_password_expires = new Date(Date.now() + 3600000); // 1 hora

        await UserRepository.save(user);

        // Enviar email con el token
        try {
            await EmailService.sendPasswordResetEmail(
                user.email,
                resetToken,
                user.username
            );
        } catch (emailError) {
            console.error('Error sending reset email:', emailError);
            // Si falla el envío del email, eliminar el token guardado
            user.reset_password_token = null;
            user.reset_password_expires = null;
            await UserRepository.save(user);
            throw new Error('Failed to send reset email. Please try again later.');
        }

        return {
            message: messages.Auth.reset_token_sent,
            email: user.email
        };
    }

    /**
     * Resetea la contraseña usando el token
     * @param token Token de reset
     * @param newPassword Nueva contraseña
     * @returns Mensaje de éxito
     */
    static async resetPassword(token: string, newPassword: string) {
        // Buscar usuarios con token de reset no expirado
        const users = await UserRepository.createQueryBuilder("user")
            .select(['user.user_id', 'user.username', 'user.email', 'user.reset_password_token', 'user.reset_password_expires', 'user.user_status'])
            .where("user.reset_password_expires > :now", { now: new Date() })
            .andWhere("user.reset_password_token IS NOT NULL")
            .getMany();

        if (!users || users.length === 0) {
            throw new Error(messages.Auth.invalid_reset_token);
        }

        // Verificar el token contra cada usuario encontrado
        let matchedUser = null;
        for (const user of users) {
            const isValid = await bcrypt.compare(token, user.reset_password_token);
            if (isValid) {
                matchedUser = user;
                break;
            }
        }

        if (!matchedUser) {
            throw new Error(messages.Auth.invalid_reset_token);
        }

        if (matchedUser.user_status !== 1) {
            throw new Error(messages.Auth.user_not_found);
        }

        // Actualizar contraseña y limpiar token
        const hashedPassword = await bcrypt.hash(newPassword, config.BCRYPT_SALT);
        matchedUser.password = hashedPassword;
        matchedUser.reset_password_token = null;
        matchedUser.reset_password_expires = null;

        await UserRepository.save(matchedUser);

        return { message: messages.Auth.password_reset_success };
    }
}