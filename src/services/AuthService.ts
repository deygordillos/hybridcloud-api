import bcrypt from "bcryptjs";
import { UserRepository } from "../repositories/UserRepository";
import config from "../config/config";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../config/jwt";
import messages from "../config/messages";

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
}