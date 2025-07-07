import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryFamily_1750131710701 implements MigrationInterface {
    table_name = 'inventory_family';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "id_inv_family",
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
                        name: "inv_family_code",
                        type: "varchar",
                        length: "20",
                        comment: "product family code"
                    },
                    {
                        name: "inv_family_name",
                        type: "varchar",
                        length: "80",
                        comment: "product family name"
                    },
                    {
                        name: "inv_family_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 active, 0 inactive"
                    },
                    {
                        name: "inv_is_stockable",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "If products are stockable. 1 yes, 0 no"
                    },
                    {
                        name: "inv_is_lot_managed",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "If products are lot managed. 1 yes, 0 no"
                    },
                    {
                        name: "tax_id",
                        type: "int",
                        unsigned: true,
                        isNullable: true,
                        comment: "Default tax id"
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
            name: 'company_inventoryFamily',
            isUnique: true,
            columnNames: ['company_id', 'inv_family_code']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_family_name',
            columnNames: ['inv_family_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_family_status',
            columnNames: ['inv_family_status']
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

        await queryRunner.dropIndex(this.table_name, 'inv_family_status');
        await queryRunner.dropIndex(this.table_name, 'inv_family_name');
        await queryRunner.dropIndex(this.table_name, 'company_inventoryFamily');
        await queryRunner.dropTable(this.table_name);
    }

}
