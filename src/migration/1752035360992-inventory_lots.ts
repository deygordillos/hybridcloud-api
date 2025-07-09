import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryLots_1752035360992 implements MigrationInterface {

    table_name = 'inventory_lots';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_lot_id",
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
                        name: "lot_number",
                        type: "varchar",
                        length: "100",
                        comment: "Lot number of the inventory variant",
                    },
                    {
                        name: "lot_origin",
                        type: "varchar",
                        length: "100",
                        comment: "Origin of the lot",
                        isNullable: true,
                    },
                    {
                        name: "lot_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 active, 0 inactive"
                    },
                    {
                        name: "expiration_date",
                        type: "date",
                        comment: "Expiration date of the lot",
                        isNullable: true,
                    },
                    {
                        name: "manufacture_date",
                        type: "date",
                        comment: "Manufacture date of the lot",
                        isNullable: true,
                    },
                    {
                        name: "lot_notes",
                        type: "text",
                        comment: "Notes of the lot",
                        isNullable: true,
                    },
                    {
                        name: "lot_unit_cost",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        comment: "Unit cost of the lot",
                        isNullable: true,
                    },
                    {
                        name: "lot_unit_currency_id",
                        type: "int",
                        default: 1,
                        comment: "Currency of the lot",
                    },
                    {
                        name: "lot_unit_cost_ref",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        comment: "Reference cost of the lot",
                        isNullable: true,
                    },
                    {
                        name: "lot_unit_currency_id_ref",
                        type: "int",
                        default: 1,
                        comment: "Reference currency of the lot",
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
            name: 'lot_number',
            columnNames: ['lot_number']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'lot_status',
            columnNames: ['lot_status']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'expiration_manufacture_date',
            columnNames: ['expiration_date', 'manufacture_date']
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_var_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);

        await queryRunner.dropIndex(this.table_name, 'expiration_manufacture_date');
        await queryRunner.dropIndex(this.table_name, 'lot_status');
        await queryRunner.dropIndex(this.table_name, 'lot_number');
        await queryRunner.dropTable(this.table_name);
    }

}
