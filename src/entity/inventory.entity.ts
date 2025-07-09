import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    Index,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from "typeorm";
import { InventoryFamily } from "./inventoryFamily.entity";
import { InventoryTaxes } from "./inventory_taxes.entity";
import { InventoryVariants } from "./inventory_variants.entity";

@Index('id_inv_family_inv_code', ['id_inv_family', 'inv_code'], { unique: true })
@Index('inv_code', ['inv_code', 'inv_description'])
@Index('inv_status_type_exempt', ['inv_status', 'inv_type', 'inv_is_exempt'])
@Entity('inventory')
export class Inventory {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_id: number;

    @Column({ type: "int", unsigned: true })
    id_inv_family: number;

    @ManyToOne(() => InventoryFamily, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'id_inv_family' })
    inventoryFamily: InventoryFamily;

    @Column({ type: "varchar", length: 50, comment: "product code of the inventory" })
    inv_code: string;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "description of the inventory" })
    inv_description: string | null;

    @Column({ type: "text", nullable: true, comment: "detailed description of the inventory" })
    inv_description_detail: string | null;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 active, 0 inactive" })
    inv_status: number;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "1 product, 2 service" })
    inv_type: number;

    @Column({ type: "tinyint", width: 1, default: 0, comment: "1 yes, 0 not" })
    inv_has_variants: number;

    @Column({ type: "tinyint", width: 1, default: 0, comment: "If product is tax exempt. 1 yes, 0 not" })
    inv_is_exempt: number;

    @Column({ type: "tinyint", width: 1, default: 1, comment: "If product is stockable. 1 yes, 0 not" })
    inv_is_stockable: number;

    @Column({ type: "tinyint", width: 1, default: 0, comment: "If product is lot managed. 1 yes, 0 not" })
    inv_is_lot_managed: number;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "product brand" })
    inv_brand: string | null;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "description of the inventory" })
    inv_model: string | null;

    @Column({ type: "varchar", length: 100, nullable: true, comment: "URL of the image of the inventory" })
    inv_url_image: string | null;

    @CreateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
    created_at: Date;

    @UpdateDateColumn({ type: "datetime", default: () => "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" })
    updated_at: Date;

    @OneToMany(() => InventoryTaxes, inventoryTaxes => inventoryTaxes.inventory)
    inventoryTaxes: InventoryTaxes[];

    @OneToMany(() => InventoryVariants, inventoryVariants => inventoryVariants.inventory)
    inventoryVariants: InventoryVariants[];
}