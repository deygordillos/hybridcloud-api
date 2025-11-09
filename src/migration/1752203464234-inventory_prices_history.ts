import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryPricesHistory_1752203464234 implements MigrationInterface {

    table_name = 'inventory_prices_history';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_price_hist_id",
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
                        name: "currency_id_ref",
                        type: "int",
                        unsigned: true,
                        comment: "Reference currency of the inventory in reference currency",
                    },
                    {
                        name: "currency_id_stable",
                        type: "int",
                        unsigned: true,
                        comment: "Stable currency of the inventory in stable currency",
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
            name: 'inv_var_id',
            columnNames: ['inv_var_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'typeprice_id',
            columnNames: ['typeprice_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_hist_var_id_typeprice_id',
            columnNames: ['inv_var_id', 'typeprice_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'hist_currency_id_local',
            columnNames: ['currency_id_local']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'hist_currency_id_stable',
            columnNames: ['currency_id_stable']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'hist_currency_id_ref',
            columnNames: ['currency_id_ref']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'user_id',
            columnNames: ['user_id']
        }))

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.table_name, 'user_id');
        await queryRunner.dropIndex(this.table_name, 'hist_currency_id_stable');
        await queryRunner.dropIndex(this.table_name, 'hist_currency_id_ref');
        await queryRunner.dropIndex(this.table_name, 'hist_currency_id_local');
        await queryRunner.dropIndex(this.table_name, 'inv_hist_var_id_typeprice_id');
        await queryRunner.dropIndex(this.table_name, 'typeprice_id');
        await queryRunner.dropIndex(this.table_name, 'inv_var_id');
        await queryRunner.dropTable(this.table_name);
    }

}
