import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index
} from "typeorm";
import { Companies } from "./companies.entity";

@Index('company_typeprice_name', ['company_id', 'typeprice_name'], { unique: true })
@Index('typeprice_status', ['typeprice_status'])
@Entity('types_of_prices')
export class TypesOfPrices {
    @PrimaryGeneratedColumn({ unsigned: true })
    typeprice_id: number;

    @Column({ type: "int", unsigned: true })
    company_id: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company: Companies;

    @Column({ type: "varchar", length: 50, comment: "name of the type of price" })
    typeprice_name: string;

    @Column({ type: "varchar", length: 150, comment: "description of the type of price" })
    typeprice_description: string;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    typeprice_status: number;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}