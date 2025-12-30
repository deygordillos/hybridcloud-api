import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddResetPasswordFields_1767062827262 implements MigrationInterface {
    table_name = 'users';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar campo reset_password_token
        await queryRunner.addColumn(this.table_name, new TableColumn({
            name: "reset_password_token",
            type: "varchar",
            length: "255",
            isNullable: true,
            comment: "token for password reset"
        }));

        // Agregar campo reset_password_expires
        await queryRunner.addColumn(this.table_name, new TableColumn({
            name: "reset_password_expires",
            type: "datetime",
            isNullable: true,
            comment: "expiration date for reset token"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar campos de reset de contraseña
        await queryRunner.dropColumn(this.table_name, "reset_password_expires");
        await queryRunner.dropColumn(this.table_name, "reset_password_token");
    }

}
