import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm"
import bcrypt from "bcryptjs"
import 'dotenv/config';

export class Users_1742525063674 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables
        await queryRunner.createTable(
            new Table({
                name: "Users",
                columns: [
                    {
                        name: "user_id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        unsigned: true,
                        generationStrategy: "increment"
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
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "CURRENT_TIMESTAMP"
                    },
                    {
                        name: "last_login",
                        type: "timestamp"
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
        await queryRunner.createIndex("Users", new TableIndex({ name: "username", columnNames: ["username"] }));
        await queryRunner.createIndex("Users", new TableIndex({ name: "user_type_username", columnNames: ["user_type", "username"] }));
        await queryRunner.createIndex("Users", new TableIndex({ name: "user_status_username", columnNames: ["user_status", "username"] }));
        await queryRunner.createIndex("Users", new TableIndex({ name: "name", columnNames: ["first_name", "last_name"] }));

        // Insert default admin user
        const saltRounds = parseInt(process.env.BCRYPT_SALT || "10", 10);
        const hashedPassword = await bcrypt.hash("admin", saltRounds);
        await queryRunner.query(`INSERT INTO users (username, password, email, first_name, is_admin) 
            VALUES ('admin', '${hashedPassword}', 'admin@admin.com', 'administrator', 1);`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex("Users", "username");
        await queryRunner.dropIndex("Users", "user_type_username");
        await queryRunner.dropIndex("Users", "user_status_username");
        await queryRunner.dropIndex("Users", "name");
        await queryRunner.dropTable("Users");
    }

}
