import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    JoinColumn
} from "typeorm";
import { Companies } from "./companies.entity";

@Index("company_code_idfiscal", ["company_id", "cust_code", "cust_id_fiscal"])
@Index("cust_description", ["cust_description"])
@Index("cust_status", ["cust_status"])

@Entity("customers")
export class Customers {
    @PrimaryGeneratedColumn({ unsigned: true })
    cust_id: number;

    @ManyToOne(() => Companies, (company) => company.customers, { 
        onDelete: "CASCADE", 
        onUpdate: "CASCADE" 
    })
    @JoinColumn({ name: 'company_id' })
    company_id: Companies;

    @Column({ type: "varchar", length: 30, comment: "código de la empresa" })
    cust_code: string;

    @Column({ type: "varchar", length: 30, comment: "id fiscal de la empresa" })
    cust_id_fiscal: string;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    cust_status: number;

    @Column({ type: "varchar", length: 30, comment: "nombre o descripción de la empresa" })
    cust_description: string;

    @Column({ type: "varchar", length: 200, nullable: true, comment: "dirección de la empresa" })
    cust_address?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "complemento de la dirección de la empresa" })
    cust_address_complement?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "ciudad dirección de la empresa" })
    cust_address_city?: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "estado de la dirección de la empresa" })
    cust_address_state?: string;

    @Column({ type: "tinyint", width: 1, default: 0, comment: "exento de impuestos 1 si 0 no" })
    cust_exempt: number;

    @Column({ type: "varchar", length: 200, nullable: true, comment: "correo de la empresa" })
    cust_email?: string;

    @Column({ type: "varchar", length: 20, nullable: true, comment: "telefono contacto 1 de la empresa" })
    cust_telephone1?: string;

    @Column({ type: "varchar", length: 20, nullable: true, comment: "telefono contacto 2 de la empresa" })
    cust_telephone2?: string;

    @Column({ type: "varchar", length: 20, nullable: true, comment: "celular contacto de la empresa" })
    cust_cellphone?: string;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}
