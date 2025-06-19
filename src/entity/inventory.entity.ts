import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn
} from "typeorm";
import { Companies } from "./companies.entity";
import { InventoryFamily } from "./inventoryFamily.entity";

@Index('company_inv_code', ['company_id', 'inv_code'], { unique: true })
@Index('inv_code', ['inv_code', 'inv_description'])
@Index('inv_status_type_exempt', ['inv_status', 'inv_type', 'inv_is_exempt'])
@Entity('Inventory')
export class Inventory {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_id: number;

    @ManyToOne(() => Companies, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'company_id' })
    company_id: Companies;

    @ManyToOne(() => InventoryFamily, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'id_inv_family' })
    id_inv_family: InventoryFamily;

    @Column({ type: "varchar", length: 50, comment: "product code of the inventory" })
    inv_code: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "description of the inventory" })
    inv_description: string | null;

    @Column({ type: "mediumtext", nullable: true, comment: "detailed description of the inventory" })
    inv_description_detail: string | null;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    inv_status: number;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 product, 2 service" })
    inv_type: number;

    @Column({ type: "tinyint", width: 1, default: 0, comment: "1 yes, 0 not" })
    inv_has_variants: number;

    @Column({ type: "tinyint", width: 1, default: 0, comment: "1 yes, 0 not" })
    inv_is_exempt: number;

    @Column({ type: "float", precision: 10, scale: 5, default: 0.0, comment: "current existence of the total product in the inventory" })
    inv_stock: number;

    @Column({ type: "float", precision: 10, scale: 5, default: 0.0, comment: "previous existence of the total product in the inventory" })
    inv_previous_stock: number;

    @Column({ type: "float", precision: 10, scale: 5, default: 0.0, comment: "average cost of the inventory" })
    inv_avg_cost: number;

    @Column({ type: "float", precision: 10, scale: 5, default: 0.0, comment: "previous avg cost of the inventory" })
    inv_avg_cost_previous: number;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "URL of the image of the inventory" })
    inv_url_image: string | null;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;
}