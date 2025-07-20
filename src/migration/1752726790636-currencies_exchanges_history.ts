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
                        scale: 8,
                        comment: "Exchange rate"
                    },
                    {
                        name: "currency_exc_type",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        isNullable: false,
                        comment: "1: local, 2: stable, 3: ref"
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

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'currency_exc_hist_company_currency_exc_type_unique',
            columnNames: ['company_id', 'currency_id', 'currency_exc_type']
        }));

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
        await queryRunner.dropIndex(this.table_name, 'currency_exc_hist_company_currency_exc_type_unique');
        await queryRunner.dropForeignKey(this.table_name, 'currency_exc_hist_company_id_foreign');
        await queryRunner.dropForeignKey(this.table_name, 'currency_exc_hist_currency_id_foreign');
        await queryRunner.dropTable(this.table_name);
    }
}
