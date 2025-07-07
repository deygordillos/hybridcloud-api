import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from "typeorm"
import { Users } from "./users.entity";
import { Companies } from "./companies.entity";

@Index('group_status_name', ['group_status', 'group_name'], {})
@Index('group_name', ['group_name'], {})
@Index('user_id', ['user_id'], {})

@Entity('Groups')
export class Groups {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true, comment: "id incremental del grupo" })
    group_id: number

    @Column({ length: 50, unique: true, comment: "nombre del grupo" })
    group_name: string

    @Column({ type: 'tinyint', width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    group_status: number

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @ManyToOne(() => Users, (users) => users.groups, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'user_id' })
    user_id: Users

    // Relationships
    @OneToMany(() => Companies, (companies) => companies.group_id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    companies: Companies[];
}