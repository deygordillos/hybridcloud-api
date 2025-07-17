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
import { InventoryLots } from "./inventory_lots.entity";
import { InventoryStorage } from "./inventoryStorage.entity";
import { Users } from "./users.entity";

@Index('inv_lot_id', ['inv_lot_id'])
@Index('movement_type', ['movement_type'])
@Index('user_id_related_doc', ['user_id', 'related_doc'])
@Entity('inventory_movements')
export class InventoryMovements {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_storage_move_id: number;

    @Column({ type: "int", unsigned: true })
    id_inv_storage: number;

    @ManyToOne(() => InventoryStorage, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'id_inv_storage' })
    inventoryStorage: InventoryStorage;

    @Column({ type: "int", unsigned: true })
    inv_var_id: number;

    @ManyToOne(() => InventoryVariants, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_var_id' })
    inventoryVariant: InventoryVariants;

    @Column({ 
        type: "int", 
        unsigned: true,
        nullable: true,
        comment: "Inventory lot ID. Required if inventory.inv_is_lot_managed = 1" 
    })
    inv_lot_id: number;

    @ManyToOne(() => InventoryLots, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_lot_id' })
    inventoryLot: InventoryLots;

    @CreateDateColumn({ 
        type: "datetime", 
        default: () => "CURRENT_TIMESTAMP" 
    })
    created_at: Date;

    @Column({ 
        type: "tinyint", 
        width: 1,
        default: 0,
        comment: "1: In, 2: Out, 3: Transfer" 
    })
    movement_type: number;

    @Column({ 
        type: "decimal", 
        precision: 10, 
        scale: 3,
        comment: "Quantity of the movement" 
    })
    quantity: number;

    @Column({ 
        type: "text",
        comment: "Reason of the movement",
        nullable: true 
    })
    movement_reason: string;

    @Column({ 
        type: "varchar", 
        length: 100,
        comment: "Related document of the movement",
        nullable: true 
    })
    related_doc: string;

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
    usersInventoryMovements: Users;
} 