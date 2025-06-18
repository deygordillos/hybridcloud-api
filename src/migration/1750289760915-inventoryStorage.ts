import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryStorage_1750289760915 implements MigrationInterface {
    table_name = 'InventoryStorage';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "id_inv_storage",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        unsigned: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "company_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "inv_storage_code",
                        type: "varchar",
                        length: "20",
                        comment: "storage code for the product"
                    },
                    {
                        name: "inv_storage_name",
                        type: "varchar",
                        length: "80",
                        comment: "storage name for the product"
                    },
                    {
                        name: "inv_storage_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 active, 0 inactive"
                    },
                    {
                        name: "created_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "updated_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_inv_storage_code',
            isUnique: true,
            columnNames: ['company_id', 'inv_storage_code']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_storage_name',
            columnNames: ['inv_storage_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_storage_status',
            columnNames: ['inv_storage_status']
        }))

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["company_id"],
                referencedColumnNames: ["company_id"],
                referencedTableName: "Companies",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("company_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);

        await queryRunner.dropIndex(this.table_name, 'inv_storage_status');
        await queryRunner.dropIndex(this.table_name, 'inv_storage_name');
        await queryRunner.dropIndex(this.table_name, 'company_inv_storage_code');
        await queryRunner.dropTable(this.table_name);
    }

}
