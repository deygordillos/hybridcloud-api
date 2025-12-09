import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class UsersAudit_1764476947266 implements MigrationInterface {

    table_name = 'users_audit';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "audit_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "user_id",
                        type: "int",
                        unsigned: true,
                        comment: "ID del usuario afectado por la acción"
                    },
                    {
                        name: "changed_by",
                        type: "int",
                        unsigned: true,
                        isNullable: true,
                        comment: "ID del usuario que realizó el cambio"
                    },
                    {
                        name: "action_type",
                        type: "enum",
                        enum: ['CREATE', 'UPDATE', 'DEACTIVATE', 'ACTIVATE', 'PASSWORD_CHANGE'],
                        comment: "Tipo de acción realizada sobre el usuario"
                    },
                    {
                        name: "changes_data",
                        type: "json",
                        isNullable: true,
                        comment: "Datos del cambio realizado en formato JSON"
                    },
                    {
                        name: "ip_address",
                        type: "varchar",
                        length: "45",
                        isNullable: true,
                        comment: "Dirección IP desde donde se realizó el cambio"
                    },
                    {
                        name: "created_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                ]
            }),
            true,
        );

        // Create indexes
        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_user_audit_user_id',
            columnNames: ['user_id']
        }));

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_user_audit_changed_by',
            columnNames: ['changed_by']
        }));

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_user_audit_action',
            columnNames: ['action_type']
        }));

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_user_audit_created',
            columnNames: ['created_at']
        }));

        // Foreign key for user_id (usuario afectado)
        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "users",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        );

        // Foreign key for changed_by (usuario que realizó el cambio)
        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["changed_by"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "users",
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);

        if (table) {
            // Drop foreign keys
            const foreignKeys = table.foreignKeys;
            for (const foreignKey of foreignKeys) {
                await queryRunner.dropForeignKey(this.table_name, foreignKey);
            }

            // Drop indexes
            await queryRunner.dropIndex(this.table_name, 'idx_user_audit_user_id');
            await queryRunner.dropIndex(this.table_name, 'idx_user_audit_changed_by');
            await queryRunner.dropIndex(this.table_name, 'idx_user_audit_action');
            await queryRunner.dropIndex(this.table_name, 'idx_user_audit_created');

            // Drop table
            await queryRunner.dropTable(this.table_name);
        }
    }

}
