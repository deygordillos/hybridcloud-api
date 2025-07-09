import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryVariants_1751747115352 implements MigrationInterface {

    table_name = 'inventory_variants';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_var_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "inv_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "inv_var_sku",
                        type: "varchar",
                        length: "100",
                        comment: "SKU of the inventory variant",
                    },
                    {
                        name: "inv_var_status",
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
            name: 'inv_id_inv_var_sku',
            columnNames: ['inv_id', 'inv_var_sku']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_var_sku_inv_var_status',
            columnNames: ['inv_var_sku', 'inv_var_status']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_var_status',
            columnNames: ['inv_var_status']
        }))

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["inv_id"],
                referencedColumnNames: ["inv_id"],
                referencedTableName: "inventory",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);

        await queryRunner.dropIndex(this.table_name, 'inv_var_status');
        await queryRunner.dropIndex(this.table_name, 'inv_var_sku_inv_var_status');
        await queryRunner.dropIndex(this.table_name, 'inv_id_inv_var_sku');
        await queryRunner.dropTable(this.table_name);
    }

}
