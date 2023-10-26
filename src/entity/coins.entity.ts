import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, JoinColumn, OneToMany } from "typeorm"

@Index('idx_coin_status', ['coin_status'], {})
@Index('idx_coin_status_name', ['coin_status', 'coin_name'], {})

@Entity('Coins')
export class Coins {
    @PrimaryGeneratedColumn({ comment: "id incremental de la moneda" })
    coin_id: number

    @Column({ length: 20, comment: "nombre de la moneda" })
    coin_name: string

    @Column({ length: 5, comment: "simbolo de la moneda", nullable: true })
    coin_symbol: string

    @Column({ width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    coin_status: number

    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'decimal', default: 1, comment: "factor de conversión" })
    coin_factor: number

    @Column({ length: 5, comment: "iso3 de la moneda", nullable: true })
    coin_iso3: string
    /////////////////////////////////////////////////////////////
    // Relaciones
    /////////////////////////////////////////////////////////////
}