import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, ManyToOne } from "typeorm"
import { Sucursales } from "./sucursales.entity"
import { Taxes } from "./taxes.entity";

@Index('idx_tax_id', ['tax_id'], {})
@Index('idx_sucursal_id', ['sucursal_id'], {})
@Index('idx_tax_id_sucursal', ['tax_id', 'sucursal_id'], {})

@Entity('Rel_Taxes_Sucursales')
export class Rel_Taxes_Sucursales {
    @PrimaryGeneratedColumn()
    tax_id_sucursal: number

    @Column({ type: "int", comment: "id tax de la empresa" })
    tax_id: number;

    @Column({ type: "int", comment: "id sucursal" })
    sucursal_id: number;
    
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    /////////////////////////////////////////////////////////////
    // Relaciones
    /////////////////////////////////////////////////////////////
    @ManyToOne(() => Taxes, (taxes) => taxes.taxes_sucursales, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'tax_id' })
    taxes: Taxes

    @ManyToOne(() => Sucursales, (suc) => suc.users_sucursales, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'sucursal_id' })
    sucursales: Sucursales
}