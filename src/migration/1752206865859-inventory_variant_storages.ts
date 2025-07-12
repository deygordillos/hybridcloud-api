import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class InventoryVariantStorages_1752206865859 implements MigrationInterface {

    table_name = 'inventory_variant_storages';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_var_storage_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "inv_var_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "id_inv_storage",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "inv_vs_stock",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        default: 0,
                        comment: "Stock of the inventory in the storage"
                    },
                    {
                        name: "inv_vs_stock_reserved",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        default: 0,
                        comment: "Stock of the inventory in the storage reserved"
                    },
                    {
                        name: "inv_vs_stock_committed",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        default: 0,
                        comment: "Stock of the inventory in the storage committed"
                    },
                    {
                        name: "inv_vs_stock_prev",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        default: 0,
                        comment: "Stock of the inventory in the storage prev"
                    },
                    {
                        name: "inv_vs_stock_min",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        default: 0,
                        comment: "Stock of the inventory in the storage min"
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
                    {
                        name: "user_id",
                        type: "int",
                        unsigned: true,
                        comment: "User ID who made this change",
                    },
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_var_id_id_inv_storage_date',
            columnNames: ['inv_var_id', 'id_inv_storage', 'created_at']
        }))

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["inv_var_id"],
                referencedColumnNames: ["inv_var_id"],
                referencedTableName: "inventory_variants",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["id_inv_storage"],
                referencedColumnNames: ["id_inv_storage"],
                referencedTableName: "inventory_storages",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "users",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
        const foreignKeyCompany2 = table.foreignKeys.find(fk => fk.columnNames.indexOf("id_inv_storage") !== -1);
        const foreignKeyCompany3 = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_var_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany2);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany3);

        await queryRunner.dropIndex(this.table_name, 'inv_var_id_id_inv_storage_date');
        await queryRunner.dropTable(this.table_name);
    }

}
