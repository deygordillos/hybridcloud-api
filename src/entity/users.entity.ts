import { Entity, Column, Index, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import bcrypt from "bcryptjs";
import { Groups } from "./groups.entity";

@Index('username', ['username'], {})
@Index('user_type_username', ['user_type', 'username'], {})
@Index('user_status_username', ['user_status', 'username'], {})
@Index('name', ['first_name', 'last_name'], {})

@Entity('Users')
export class Users {
    @PrimaryGeneratedColumn({ unsigned: true })
    user_id: number
    
    @Column({ length: 20, comment: "ip login", nullable: true })
    ip_address: string

    @Column({ width: 1, default: 2, comment: "1 user api, 2 user web, 3 user pos, 4 user app" })
    user_type: number

    @Column({ length: 100, unique: true, comment: "username to login" })
    username: string

    @Column({ length: 150, comment: "password to login" })
    password: string

    @Column({ width: 1, default: 1, comment: "1 activo, 0 inactivo" })
    user_status: number

    @Column({ length: 150, unique: true, comment: "email to contact or reset login" })
    email: string

    @Column({ length: 50, comment: "user first name" })
    first_name: string

    @Column({ length: 50, comment: "user lastname", nullable: true })
    last_name: string

    @Column({ length: 20, comment: "user phone number", nullable: true })
    user_phone: string

    @CreateDateColumn({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @UpdateDateColumn({ type: 'datetime' })
    updated_at: Date;

    @Column({ type: 'datetime', nullable: true, comment: "last login date" })
    last_login: Date | null;

    @Column({ length: 700, comment: "access token login", nullable: true, select: false })
    access_token: string

    @Column({ length: 700, comment: "refresh token login", nullable: true, select: false })
    refresh_token: string

    @Column({ width: 1, default: 0, comment: "1 es user admin, 0 no es user admin" })
    is_admin: number

    async validarPassword(password: string): Promise<boolean> {
        return bcrypt.compare(password, this.password);
    }

    // Relationships
    @OneToMany(() => Groups, (groups) => groups.user_id, {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
    })
    groups: Groups[];
}