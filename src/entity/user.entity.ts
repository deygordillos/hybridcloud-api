import { Entity, Column, Index, PrimaryGeneratedColumn } from "typeorm"

@Index(['empresa', 'sucursal', 'usuario'], { unique: true })
@Index('USERUNIQUE',['usuario'], { unique: true })
@Entity('usuariobdd')
export class User {
    @Column({length: 12, nullable: true, default: '01'})
    grupo: string

    @Column({length: 12})
    empresa: string

    @Column({length: 12})
    sucursal: string

    @Column({length: 30})
    usuario: string

    @Column({length: 200, nullable: true})
    nombre: string

    @Column({length: 25})
    clave: string

    @Column({width: 1, comment: 'Tipo usuario: 0: POS, 1: Web, 2: Movil', default: 0, nullable: true})
    perfil: number

    @Column({length: 100, nullable: true})
    bdd: string

    @Column({length: 1, nullable: true, default: 'A'})
    estatus: string

    @Column({length: 50})
    consecutivo: string

    @Column({length: 50, default: '-23'})
    serialseguro: string

    @PrimaryGeneratedColumn()
    id: number
}