import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryPrices_1752105600781 implements MigrationInterface {

    table_name = 'inventory_prices';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_price_id",
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
                        name: "typeprice_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "is_current",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "1 yes, 0 no"
                    },
                    {
                        name: "price_local",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Total price of the inventory in local currency",
                        isNullable: true,
                    },
                    {
                        name: "price_stable",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Total price of the inventory in stable currency",
                        isNullable: true,
                    },
                    {
                        name: "price_ref",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Total price of the inventory in reference currency",
                        isNullable: true,
                    },
                    {
                        name: "price_base_local",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Base price of the inventory in local currency",
                        isNullable: true,
                    },
                    {
                        name: "price_base_stable",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Base price of the inventory in stable currency",
                        isNullable: true,
                    },
                    {
                        name: "price_base_ref",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Base price of the inventory in reference currency",
                        isNullable: true,
                    },
                    {
                        name: "tax_amount_local",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Tax amount of the inventory in local currency",
                        isNullable: true,
                    },
                    {
                        name: "tax_amount_stable",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Tax amount of the inventory in stable currency",
                        isNullable: true,
                    },
                    {
                        name: "tax_amount_ref",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Tax amount of the inventory in reference currency",
                        isNullable: true,
                    },
                    {
                        name: "cost_local",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Cost of the inventory in local currency",
                        isNullable: true,
                    },
                    {
                        name: "cost_stable",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Cost of the inventory in stable currency",
                        isNullable: true,
                    },
                    {
                        name: "cost_ref",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Cost of the inventory in reference currency",
                        isNullable: true,
                    },
                    {
                        name: "cost_avg_local",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Average cost of the inventory in local currency",
                        isNullable: true,
                    },
                    {
                        name: "cost_avg_stable",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Average cost of the inventory in stable currency",
                        isNullable: true,
                    },
                    {
                        name: "cost_avg_ref",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Average cost of the inventory in reference currency",
                        isNullable: true,
                    },
                    {
                        name: "profit_local",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Profit of the inventory in local currency",
                        isNullable: true,
                    },
                    {
                        name: "profit_stable",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Profit of the inventory in stable currency",
                        isNullable: true,
                    },
                    {
                        name: "profit_ref",
                        type: "decimal",
                        precision: 18,
                        scale: 3,
                        comment: "Profit of the inventory in reference currency",
                        isNullable: true,
                    },
                    {
                        name: "currency_id_local",
                        type: "int",
                        default: 1,
                        unsigned: true,
                        comment: "Currency of the inventory in local currency",
                    },
                    {
                        name: "currency_id_stable",
                        type: "int",
                        unsigned: true,
                        comment: "Currency of the inventory in stable currency",
                    },
                    {
                        name: "currency_id_ref",
                        type: "int",
                        unsigned: true,
                        comment: "Reference currency of the inventory in reference currency",
                    },
                    {
                        name: "valid_from",
                        type: "date",
                        isNullable: true
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
            name: 'inv_var_id_typeprice_id',
            columnNames: ['inv_var_id', 'typeprice_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'currency_id_local',
            columnNames: ['currency_id_local']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'currency_id_stable',
            columnNames: ['currency_id_stable']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'currency_id_ref',
            columnNames: ['currency_id_ref']
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
                columnNames: ["typeprice_id"],
                referencedColumnNames: ["typeprice_id"],
                referencedTableName: "types_of_prices",
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
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("typeprice_id") !== -1);
        const foreignKeyCompany2 = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_var_id") !== -1);
        const foreignKeyCompany3 = table.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany2);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany3);

        await queryRunner.dropIndex(this.table_name, 'currency_id_local');
        await queryRunner.dropIndex(this.table_name, 'currency_id_stable');
        await queryRunner.dropIndex(this.table_name, 'currency_id_ref');
        await queryRunner.dropIndex(this.table_name, 'inv_var_id_typeprice_id');
        await queryRunner.dropTable(this.table_name);
    }

}
