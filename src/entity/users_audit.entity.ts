import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Users } from "./users.entity";

@Index('idx_user_audit_user_id', ['user_id'], {})
@Index('idx_user_audit_changed_by', ['changed_by'], {})
@Index('idx_user_audit_action', ['action_type'], {})
@Index('idx_user_audit_created', ['created_at'], {})

@Entity('users_audit')
export class UsersAudit {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    audit_id: number

    @ManyToOne(() => Users, (user) => user.user_id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "user_id" })
    user_id: Users;

    @ManyToOne(() => Users, (user) => user.user_id, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true
    })
    @JoinColumn({ name: "changed_by" })
    changed_by: Users | null;

    @Column({ 
        type: 'simple-enum', 
        enum: ['CREATE', 'UPDATE', 'DEACTIVATE', 'ACTIVATE', 'PASSWORD_CHANGE'],
        comment: "Tipo de acción realizada sobre el usuario"
    })
    action_type: string;

    @Column({ 
        type: 'json', 
        nullable: true,
        comment: "Datos del cambio realizado en formato JSON"
    })
    changes_data: object | null;

    @Column({ 
        length: 45, 
        nullable: true,
        comment: "Dirección IP desde donde se realizó el cambio"
    })
    ip_address: string | null;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}
