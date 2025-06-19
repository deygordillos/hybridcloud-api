import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class Taxes_1750291867379 implements MigrationInterface {
    table_name = 'Taxes';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "tax_id",
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
                        name: "tax_code",
                        type: "varchar",
                        length: "20",
                        comment: "tax code of the products",
                    },
                    {
                        name: "tax_name",
                        type: "varchar",
                        length: "50",
                        comment: "tax name of the products",
                    },
                    {
                        name: "tax_description",
                        type: "varchar",
                        length: "150",
                        comment: "tax description of the products",
                    },
                    {
                        name: "tax_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 active, 0 inactive"
                    },
                    {
                        name: "tax_type",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 excent, 2 percent",
                    },
                    {
                        name: "tax_percentage",
                        type: "float",
                        default: 0.0,
                        precision: 5,
                        scale: 2,
                        comment: "1 excent, 2 percent",
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
            name: 'company_tax_code',
            isUnique: true,
            columnNames: ['company_id', 'tax_code']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'tax_name_desc',
            columnNames: ['tax_name', 'tax_description']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'tax_status',
            columnNames: ['tax_status']
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

        await queryRunner.dropIndex(this.table_name, 'tax_status');
        await queryRunner.dropIndex(this.table_name, 'tax_name_desc');
        await queryRunner.dropIndex(this.table_name, 'company_tax_code');
        await queryRunner.dropTable(this.table_name);
    }

}
