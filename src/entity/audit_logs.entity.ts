import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { Companies } from "./companies.entity";
import { Users } from "./users.entity";

@Index('idx_audit_logs_entity', ['entity_type', 'entity_id'], {})
@Index('idx_audit_logs_company_created', ['company_id', 'created_at'], {})
@Index('idx_audit_logs_changed_by', ['changed_by'], {})

@Entity('audit_logs')
export class AuditLogs {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    audit_id: number

    @Column({ type: 'int', unsigned: true, comment: "Empresa a la que pertenece el registro auditado" })
    company_id: number;

    @Column({ type: 'varchar', length: 50, comment: "Tipo de entidad auditada: taxes, customers, orders, inventory_prices, currencies_exchanges, ..." })
    entity_type: string;

    @Column({ type: 'int', unsigned: true, comment: "ID del registro auditado" })
    entity_id: number;

    @Column({
        type: 'simple-enum',
        enum: ['CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE', 'STATUS_CHANGE'],
        comment: "Tipo de acción realizada sobre la entidad"
    })
    action_type: string;

    @Column({
        type: 'json',
        nullable: true,
        comment: "Diff del cambio en formato JSON: { before: {...}, after: {...} } solo con campos modificados"
    })
    changes_data: object | null;

    @ManyToOne(() => Users, (user) => user.user_id, {
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
        nullable: true
    })
    @JoinColumn({ name: "changed_by" })
    changed_by: Users | null;

    @Column({
        length: 45,
        nullable: true,
        comment: "Dirección IP desde donde se realizó el cambio"
    })
    ip_address: string | null;

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company: Companies;
}
