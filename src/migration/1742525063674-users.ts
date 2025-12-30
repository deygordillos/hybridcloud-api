import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"
import bcrypt from "bcryptjs"
import config from "../config/config";

export class Users_1742525063674 implements MigrationInterface {
    table_name = 'users';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        // Create tables
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "user_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "ip_address",
                        type: "varchar",
                        isNullable: true,
                        length: "20",
                        comment: "ip login"
                    },
                    {
                        name: "user_type",
                        type: "tinyint",
                        default: 2,
                        width: 1,
                        comment: "1 user api, 2 user web, 3 user pos, 4 user app"
                    },
                    {
                        name: "username",
                        type: "varchar",
                        length: "100",
                        isUnique: true,
                        comment: "username to login"
                    },
                    {
                        name: "password",
                        type: "varchar",
                        length: "150",
                        comment: "password to login"
                    },
                    {
                        name: "user_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 activo, 0 inactivo"
                    },
                    {
                        name: "email",
                        type: "varchar",
                        length: "150",
                        isUnique: true,
                        comment: "email to contact or reset login"
                    },
                    {
                        name: "first_name",
                        type: "varchar",
                        length: "50",
                        comment: "user first name"
                    },
                    {
                        name: "last_name",
                        type: "varchar",
                        length: "50",
                        isNullable: true,
                        comment: "user lastname"
                    },
                    {
                        name: "user_phone",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                        comment: "user phone number"
                    },
                    {
                        name: "created_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updated_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "last_login",
                        type: "datetime",
                        isNullable: true,
                        comment: "last login date"
                    },
                    {
                        name: "access_token",
                        type: "varchar",
                        length: "700",
                        isNullable: true,
                        comment: "access token login"
                    },
                    {
                        name: "refresh_token",
                        type: "varchar",
                        length: "700",
                        isNullable: true,
                        comment: "refresh token login"
                    },
                    {
                        name: "is_admin",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "1 es user admin, 0 no es user admin"
                    }
                ],
            }),
            true,
        );

        // Create indexes
        await queryRunner.createIndex(this.table_name, new TableIndex({ name: "username", columnNames: ["username"] }));
        await queryRunner.createIndex(this.table_name, new TableIndex({ name: "user_type_username", columnNames: ["user_type", "username"] }));
        await queryRunner.createIndex(this.table_name, new TableIndex({ name: "user_status_username", columnNames: ["user_status", "username"] }));
        await queryRunner.createIndex(this.table_name, new TableIndex({ name: "name", columnNames: ["first_name", "last_name"] }));

        const [existing] = await queryRunner.query(
        `SELECT 1 FROM ${this.table_name} WHERE username = ? LIMIT 1`,
        ['admin']
        );
        if (!existing) {
            // Insert default admin user
            // Password: Admin123 (cumple requisitos: 8+ chars, mayúscula, minúscula, número)
            const hashedPassword = await bcrypt.hash("Admin123", config.BCRYPT_SALT);
            await queryRunner.query(`INSERT INTO ${this.table_name} (username, password, email, first_name, is_admin) 
                VALUES (?, ?, ?, ?, ?);`, 
                ['admin', hashedPassword, 'admin@admin.com', 'administrator', 1]
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.table_name, "username");
        await queryRunner.dropIndex(this.table_name, "user_type_username");
        await queryRunner.dropIndex(this.table_name, "user_status_username");
        await queryRunner.dropIndex(this.table_name, "name");
        await queryRunner.dropTable(this.table_name);
    }

}
