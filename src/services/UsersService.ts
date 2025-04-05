import { UserRepository } from "../repositories/UserRepository";

export class UsersService {
    static async findUserById(user_id: number) {
        return await UserRepository.findOneBy({ user_id });
    }
}