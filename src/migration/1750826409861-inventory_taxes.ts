import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryTaxes_1750826409861 implements MigrationInterface {

    table_name = 'inventory_taxes';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_tax_id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        unsigned: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "inv_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "tax_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "created_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                ]
            }),
            true,
        );

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

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["tax_id"],
                referencedColumnNames: ["tax_id"],
                referencedTableName: "taxes",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("tax_id") !== -1);
        const foreignKeyCompany2 = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany2);
        await queryRunner.dropTable(this.table_name);
    }

}
