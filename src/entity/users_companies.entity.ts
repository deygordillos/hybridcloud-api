import { Entity, Index, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, ManyToOne, Column } from "typeorm"
import { Users } from "./users.entity";
import { Companies } from "./companies.entity";

@Index('idx_user_id', ['user_id'], {})
@Index('idx_company_id', ['company_id'], {})
@Index('idx_user_company', ['user_id', 'company_id'], {})

@Entity('UsersCompanies')
export class UsersCompanies {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    user_company_id: number

    @ManyToOne(() => Users, (user) => user.user_id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "user_id" })
    user_id: Users;

    @ManyToOne(() => Companies, (company) => company.company_id, { 
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: "company_id" })
    company_id: Companies;

    @Column({ type: "tinyint", width: 1, default: 0, comment: "Si es o no user admin de la empresa" })
    is_company_admin: number

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;
}