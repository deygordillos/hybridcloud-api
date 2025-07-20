import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CurrenciesExchangesHistory_1752726790636 implements MigrationInterface {

    table_name = 'currencies_exchanges_history';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';
        
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "currency_exc_hist_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "company_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "currency_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "currency_exc_rate",
                        type: "decimal",
                        precision: 10,
                        scale: 5,
                        comment: "Exchange rate"
                    },
                    {
                        name: "is_base_currency",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "1: Base currency, 0: Not base currency"
                    },
                    {
                        name: "exchange_method",
                        type: "enum",
                        enum: ["DIVIDE", "MULTIPLY"],
                        default: "'MULTIPLY'",
                        comment: "Method to calculate exchange rate"
                    },
                    {
                        name: "created_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    }
                ]
            }),
            true,
        );

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                name: 'currency_exc_hist_company_id_foreign',
                columnNames: ['company_id'],
                referencedColumnNames: ['company_id'],
                referencedTableName: 'companies',
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION',
            })
        )

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                name: 'currency_exc_hist_currency_id_foreign',
                columnNames: ['currency_id'],
                referencedColumnNames: ['currency_id'],
                referencedTableName: 'currencies',
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION',
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(this.table_name, 'currency_exc_hist_company_id_foreign');
        await queryRunner.dropForeignKey(this.table_name, 'currency_exc_hist_currency_id_foreign');
        await queryRunner.dropTable(this.table_name);
    }
}
