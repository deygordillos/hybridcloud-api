import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class AuditLogs_1784345374752 implements MigrationInterface {

    table_name = 'audit_logs';

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
                        name: "company_id",
                        type: "int",
                        unsigned: true,
                        comment: "Empresa a la que pertenece el registro auditado"
                    },
                    {
                        name: "entity_type",
                        type: "varchar",
                        length: "50",
                        comment: "Tipo de entidad auditada"
                    },
                    {
                        name: "entity_id",
                        type: "int",
                        unsigned: true,
                        comment: "ID del registro auditado"
                    },
                    {
                        name: "action_type",
                        type: "enum",
                        enum: ['CREATE', 'UPDATE', 'DELETE', 'ACTIVATE', 'DEACTIVATE', 'STATUS_CHANGE'],
                        comment: "Tipo de acción realizada sobre la entidad"
                    },
                    {
                        name: "changes_data",
                        type: "json",
                        isNullable: true,
                        comment: "Diff del cambio en formato JSON"
                    },
                    {
                        name: "changed_by",
                        type: "int",
                        unsigned: true,
                        isNullable: true,
                        comment: "ID del usuario que realizó el cambio"
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

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_audit_logs_entity',
            columnNames: ['entity_type', 'entity_id']
        }));

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_audit_logs_company_created',
            columnNames: ['company_id', 'created_at']
        }));

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_audit_logs_changed_by',
            columnNames: ['changed_by']
        }));

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["company_id"],
                referencedColumnNames: ["company_id"],
                referencedTableName: "companies",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        );

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
            for (const foreignKey of table.foreignKeys) {
                await queryRunner.dropForeignKey(this.table_name, foreignKey);
            }

            await queryRunner.dropIndex(this.table_name, 'idx_audit_logs_entity');
            await queryRunner.dropIndex(this.table_name, 'idx_audit_logs_company_created');
            await queryRunner.dropIndex(this.table_name, 'idx_audit_logs_changed_by');

            await queryRunner.dropTable(this.table_name);
        }
    }

}
