import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class Inventory_1750303338066 implements MigrationInterface {

    table_name = 'Inventory';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_id",
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
                        name: "id_inv_family",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "inv_code",
                        type: "varchar",
                        length: "50",
                        comment: "product code of the inventory",
                    },
                    {
                        name: "inv_description",
                        type: "varchar",
                        length: "100",
                        comment: "description of the inventory",
                    },
                    {
                        name: "inv_description_detail",
                        type: "mediumtext",
                        comment: "detailed description of the inventory",
                    },
                    {
                        name: "inv_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 active, 0 inactive"
                    },
                    {
                        name: "inv_type",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 product, 2 service",
                    },
                    {
                        name: "inv_is_exempt",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 yes, 0 not",
                    },
                    {
                        name: "inv_current_existence",
                        type: "float",
                        default: 0.0,
                        precision: 10,
                        scale: 5,
                        comment: "current existence of the inventory",
                    },
                    {
                        name: "inv_previous_existence",
                        type: "float",
                        default: 0.0,
                        precision: 10,
                        scale: 5,
                        comment: "previous existence of the inventory",
                    },
                    {
                        name: "inv_url_image",
                        type: "varchar",
                        length: "100",
                        comment: "URL of the image of the inventory",
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
            name: 'company_inv_code',
            isUnique: true,
            columnNames: ['company_id', 'inv_code']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_code',
            columnNames: ['inv_code', 'inv_description']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_status_type_exempt',
            columnNames: ['inv_status', 'inv_type', 'inv_is_exempt']
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

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["id_inv_family"],
                referencedColumnNames: ["id_inv_family"],
                referencedTableName: "InventoryFamily",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("company_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);

        await queryRunner.dropIndex(this.table_name, 'inv_status_type_exempt');
        await queryRunner.dropIndex(this.table_name, 'inv_code');
        await queryRunner.dropIndex(this.table_name, 'company_inv_code');
        await queryRunner.dropTable(this.table_name);
    }

}
