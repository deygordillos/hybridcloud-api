import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class Inventory_1750303338066 implements MigrationInterface {

    table_name = 'inventory';

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
                        isNullable: true,
                        comment: "description of the inventory",
                    },
                    {
                        name: "inv_description_detail",
                        type: "mediumtext",
                        isNullable: true,
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
                        name: "inv_has_variants",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "1 yes, 0 not",
                    },
                    {
                        name: "inv_is_exempt",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "If product is tax exempt. 1 yes, 0 not",
                    },
                    {
                        name: "inv_is_stockable",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "If product is stockable. 1 yes, 0 not",
                    },
                    {
                        name: "inv_is_lot_managed",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "If product is lot managed. 1 yes, 0 not",
                    },
                    {
                        name: "inv_brand",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                        comment: "product brand",
                    },
                    {
                        name: "inv_model",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                        comment: "description of the inventory",
                    },
                    {
                        name: "inv_url_image",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
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
            name: 'id_inv_family_inv_code',
            isUnique: true,
            columnNames: ['id_inv_family', 'inv_code']
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
                columnNames: ["id_inv_family"],
                referencedColumnNames: ["id_inv_family"],
                referencedTableName: "inventory_family",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("id_inv_family") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);

        await queryRunner.dropIndex(this.table_name, 'inv_status_type_exempt');
        await queryRunner.dropIndex(this.table_name, 'inv_code');
        await queryRunner.dropIndex(this.table_name, 'id_inv_family_inv_code');
        await queryRunner.dropTable(this.table_name);
    }

}
