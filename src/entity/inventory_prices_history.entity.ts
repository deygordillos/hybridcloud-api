import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index
} from "typeorm";
import { InventoryVariants } from "./inventory_variants.entity";
import { TypesOfPrices } from "./types_of_prices.entity";
import { Users } from "./users.entity";

@Index('inv_hist_var_id_typeprice_id', ['inv_var_id', 'typeprice_id'])
@Index('inv_var_id', ['inv_var_id'])
@Index('inv_hist_currency_id_local', ['currency_id_local'])
@Index('inv_hist_currency_id_ref', ['currency_id_ref'])
@Index('inv_hist_currency_id_stable', ['currency_id_stable'])
@Index('typeprice_id', ['typeprice_id'])
@Index('user_id', ['user_id'])
@Entity('inventory_prices_history')
export class InventoryPricesHistory {
    @PrimaryGeneratedColumn({ unsigned: true })
    inv_price_hist_id: number;

    @Column({ type: "int", unsigned: true })
    inv_var_id: number;

    @ManyToOne(() => InventoryVariants, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'inv_var_id' })
    inventoryVariant: InventoryVariants;

    @Column({ type: "int", unsigned: true })
    typeprice_id: number;

    @ManyToOne(() => TypesOfPrices, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'typeprice_id' })
    typeOfPrice: TypesOfPrices;

    @Column({ 
        type: "tinyint", 
        default: 0, 
        width: 1, 
        comment: "1 yes, 0 no" 
    })
    is_current: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Total price of the inventory in local currency" 
    })
    price_local: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Total price of the inventory in stable currency" 
    })
    price_stable: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Total price of the inventory in reference currency" 
    })
    price_ref: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Base price of the inventory in local currency" 
    })
    price_base_local: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Base price of the inventory in stable currency" 
    })
    price_base_stable: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Base price of the inventory in reference currency" 
    })
    price_base_ref: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Tax amount of the inventory in local currency" 
    })
    tax_amount_local: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Tax amount of the inventory in stable currency" 
    })
    tax_amount_stable: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Tax amount of the inventory in reference currency" 
    })
    tax_amount_ref: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Cost of the inventory in local currency" 
    })
    cost_local: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Cost of the inventory in stable currency" 
    })
    cost_stable: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Cost of the inventory in reference currency" 
    })
    cost_ref: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Average cost of the inventory in local currency" 
    })
    cost_avg_local: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Average cost of the inventory in stable currency" 
    })
    cost_avg_stable: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Average cost of the inventory in reference currency" 
    })
    cost_avg_ref: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Profit of the inventory in local currency" 
    })
    profit_local: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Profit of the inventory in stable currency" 
    })
    profit_stable: number;

    @Column({ 
        type: "decimal", 
        precision: 18, 
        scale: 3, 
        nullable: true,
        comment: "Profit of the inventory in reference currency" 
    })
    profit_ref: number;

    @Column({ 
        type: "int", 
        default: 1,
        unsigned: true,
        comment: "Currency of the inventory in local currency" 
    })
    currency_id_local: number;

    @Column({ 
        type: "int",
        unsigned: true,
        comment: "Stable currency of the inventory in stable currency" 
    })
    currency_id_stable: number;

    @Column({ 
        type: "int",
        unsigned: true,
        comment: "Reference currency of the inventory in reference currency" 
    })
    currency_id_ref: number;

    @Column({ 
        type: "date", 
        default: () => "CURRENT_TIMESTAMP" 
    })
    valid_from: Date;

    @CreateDateColumn({ 
        type: "datetime", 
        default: () => "CURRENT_TIMESTAMP" 
    })
    created_at: Date;

    
    @Column({ 
        type: "int", 
        unsigned: true,
        comment: "User ID who made this change" 
    })
    user_id: number;

    @ManyToOne(() => Users, { onDelete: "CASCADE", onUpdate: "CASCADE" })
    @JoinColumn({ name: 'user_id' })
    usersInventoryPricesHistory: Users;
} 