import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class InventoryLotsStorages_1752207228804 implements MigrationInterface {

    table_name = 'inventory_lots_storages';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_lot_storage_id",
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
                        name: "inv_lot_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "id_inv_storage",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "inv_ls_stock",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        comment: "Stock of the inventory in the storage",
                        default: 0
                    },
                    {
                        name: "inv_ls_stock_reserved",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        comment: "Stock of the inventory in the storage reserved",
                        default: 0
                    },
                    {
                        name: "inv_ls_stock_committed",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        comment: "Stock of the inventory in the storage committed",
                        default: 0
                    },
                    {
                        name: "inv_ls_stock_prev",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        comment: "Stock of the inventory in the storage prev",
                        default: 0
                    },
                    {
                        name: "inv_ls_stock_min",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        comment: "Stock of the inventory in the storage min",
                        default: 0
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
            name: 'inv_var_id_lot_storage_date',
            columnNames: ['inv_var_id', 'inv_lot_id', 'id_inv_storage', 'created_at']
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
                columnNames: ["inv_lot_id"],
                referencedColumnNames: ["inv_lot_id"],
                referencedTableName: "inventory_lots",
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
        const foreignKeyCompany3 = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_lot_id") !== -1);
        const foreignKeyCompany4 = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_var_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany2);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany3);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany4);

        await queryRunner.dropIndex(this.table_name, 'inv_var_id_lot_storage_date');
        await queryRunner.dropTable(this.table_name);
    }

}
