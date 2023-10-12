import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, ManyToOne } from "typeorm"
import { Users } from "./users.entity"
import { Sucursales } from "./sucursales.entity"

@Index('idx_user_id', ['user_id'], {})
@Index('idx_sucursal_id', ['sucursal_id'], {})
@Index('idx_user_sucursal', ['user_id', 'sucursal_id'], {})

@Entity('Rel_Users_Sucursales')
export class Rel_Users_Sucursales {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: "int", comment: "id usuario" })
    user_id: number;

    @Column({ type: "int", comment: "id sucursal" })
    sucursal_id: number;

    /////////////////////////////////////////////////////////////
    // Relaciones
    /////////////////////////////////////////////////////////////
    @ManyToOne(() => Users, (users) => users.users_sucursales, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'user_id' })
    users: Users

    @ManyToOne(() => Sucursales, (suc) => suc.users_sucursales, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    @JoinColumn({ name: 'sucursal_id' })
    sucursales: Sucursales
}