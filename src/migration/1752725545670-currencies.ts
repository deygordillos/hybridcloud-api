import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class Currencies_1752725545670 implements MigrationInterface {

    table_name = 'currencies';
    // https://www.iso.org/iso-4217-currency-codes.html

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';
        
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "currency_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "currency_iso_code",
                        type: "varchar",
                        length: "5",
                        comment: "ISO code of the currency"
                    },
                    {
                        name: "currency_name",
                        type: "varchar",
                        length: "40",
                        comment: "Name of the currency"
                    },
                    {
                        name: "currency_symbol",
                        type: "varchar",
                        length: "10",
                        comment: "Symbol of the currency"
                    },
                    {
                        name: "currency_status",
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

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'currency_iso_code',
            columnNames: ['currency_iso_code']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'currency_name',
            columnNames: ['currency_name']
        }))

        const [existing] = await queryRunner.query(
            `SELECT 1 FROM ${this.table_name} WHERE currency_iso_code = ? LIMIT 1`,
            ['VES']
            );
            if (!existing) {
                await queryRunner.query(`INSERT INTO ${this.table_name} (currency_iso_code, currency_name, currency_symbol, currency_status) 
                    VALUES (?, ?, ?, ?), (?, ?, ?, ?);`, 
                    [
                        'VES', 'Bolívar', 'Bs', 1, 
                        'USD', 'Dólar', '$', 1
                    ]
                );
            }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.table_name, 'currency_iso_code');
        await queryRunner.dropIndex(this.table_name, 'currency_name');
        await queryRunner.dropTable(this.table_name);
    }

}
