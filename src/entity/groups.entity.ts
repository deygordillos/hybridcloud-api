import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Index('group_status_name', ['group_status', 'group_name'], {})

@Entity('Groups')
export class Groups {
    @PrimaryGeneratedColumn({ type: 'int', comment: "id incremental del grupo" })
    group_id: number

    @Column({ length: 50, comment: "nombre del grupo" })
    group_name: string

    @Column({ type: 'tinyint', width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    group_status: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    @Column({ type: 'int', default: 0, comment: "id del usuario que creó el grupo" })
    created_by: number
}