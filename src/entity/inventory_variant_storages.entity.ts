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
import { InventoryVariants } from "./inventory_variants.entity";
import { InventoryStorage } from "./inventoryStorage.entity";
import { Users } from "./users.entity";

@Index('inv_var_id_id_inv_storage_date', ['inv_var_id', 'id_inv_storage', 'created_at'])
@Index('inv_var_id', ['inv_var_id'])
@Index('id_inv_storage', ['id_inv_storage'])
@Index('user_id', ['user_id'])
@Entity('inventory_variant_storages')
export class InventoryVariantStorages {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_var_storage_id: number;

    @Column({ type: "int", unsigned: true })
    inv_var_id: number;

    @ManyToOne(() => InventoryVariants, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_var_id' })
    inventoryVariant: InventoryVariants;

    @Column({ type: "int", unsigned: true })
    id_inv_storage: number;

    @ManyToOne(() => InventoryStorage, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'id_inv_storage' })
    inventoryStorage: InventoryStorage;

    @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 3,
        comment: "Stock of the inventory in the storage",
        default: 0
    })
    inv_vs_stock: number;

    @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 3,
        comment: "Stock of the inventory in the storage reserved",
        default: 0
    })
    inv_vs_stock_reserved: number;

    @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 3,
        comment: "Stock of the inventory in the storage committed",
        default: 0
    })
    inv_vs_stock_committed: number;

    @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 3,
        comment: "Stock of the inventory in the storage prev",
        default: 0
    })
    inv_vs_stock_prev: number;

    @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 3,
        comment: "Stock of the inventory in the storage min",
        default: 0
    })
    inv_vs_stock_min: number;

    @CreateDateColumn({ 
        type: "datetime", 
        default: () => "CURRENT_TIMESTAMP" 
    })
    created_at: Date;

    @UpdateDateColumn({ 
        type: "datetime", 
        default: () => "CURRENT_TIMESTAMP", 
        onUpdate: "CURRENT_TIMESTAMP" 
    })
    updated_at: Date;

    @Column({ 
        type: "int", 
        unsigned: true,
        comment: "User ID who made this change" 
    })
    user_id: number;

    @ManyToOne(() => Users, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'user_id' })
    usersInventoryVariantStorages: Users;
} 