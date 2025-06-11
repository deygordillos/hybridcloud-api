import messages from "../config/messages";
import { Users } from "../entity/users.entity";
import { GroupRepository } from "../repositories/GroupRepository";

export class GroupService {
    static async findGroups(offset: number = 0, limit: number = 10) {
        const total = await GroupRepository.count();
        const groups = await GroupRepository.find({
            skip: offset,
            take: limit,
            order: {
                group_id: "DESC"
            }
        })
        return { total: total, filtered: groups.length, data: groups }
    }

    static async create(group_name: string, user: Users) {
        // Verificar si el grupo ya existe
        const existingGroup = await GroupRepository.findOneBy({ group_name });
        if (existingGroup) throw new Error(messages.Groups.group_exists || "Ups! Group already exists.");

        const group = GroupRepository.create({ group_name: group_name, user_id: user, created_at: new Date(), updated_at: new Date() });
        await GroupRepository.save(group);
        return { message: messages.Groups.group_created };
    }

    static async findGroupById(group_id: number) {
        return await GroupRepository.findOneBy({ group_id });
    }

    static async findGroupName(group_name: string) {
        return await GroupRepository.findOneBy({ group_name });
    }

    static async update(group_id: number, group_name: string, group_status: number) {
        const group = await GroupRepository.findOneBy({ group_id });
        if (!group) throw new Error(messages.Groups.group_not_exists || "Ups! Group not exists.");

        group.group_name = group_name || group.group_name;
        group.group_status = (group_status == 0 || group_status == 1 ? group_status : group.group_status);
        group.updated_at = new Date();
        await GroupRepository.save(group);
        return { message: messages.Groups.group_updated };
    }
}