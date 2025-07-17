import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class CurrenciesExchanges_1752726516198 implements MigrationInterface {

    table_name = 'currencies_exchanges';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';
        
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "currency_exc_id",
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
                        name: "currency_from_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "currency_to_id",
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
                        name: "currency_exc_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1: Active, 0: Inactive"
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
                name: 'currency_exc_company_id_foreign',
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
                name: 'currency_exc_currency_from_id_foreign',
                columnNames: ['currency_from_id'],
                referencedColumnNames: ['currency_id'],
                referencedTableName: 'currencies',
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION',
            })
        )

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                name: 'currency_exc_currency_to_id_foreign',
                columnNames: ['currency_to_id'],
                referencedColumnNames: ['currency_id'],
                referencedTableName: 'currencies',
                onUpdate: 'NO ACTION',
                onDelete: 'NO ACTION',
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(this.table_name, 'currency_exc_company_id_foreign');
        await queryRunner.dropForeignKey(this.table_name, 'currency_exc_currency_from_id_foreign');
        await queryRunner.dropForeignKey(this.table_name, 'currency_exc_currency_to_id_foreign');
        await queryRunner.dropTable(this.table_name);
    }
}
