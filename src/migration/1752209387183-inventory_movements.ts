import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryMovements_1752209387183 implements MigrationInterface {

    table_name = 'inventory_movements';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_storage_move_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "id_inv_storage",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "inv_var_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "inv_lot_id",
                        type: "int",
                        unsigned: true,
                        isNullable: true,
                        comment: "Inventory lot ID. Required if inventory.inv_is_lot_managed = 1"
                    },
                    {
                        name: "created_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "movement_type",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "1: In, 2: Out, 3: Transfer"
                    },
                    {
                        name: "quantity",
                        type: "decimal",
                        precision: 10,
                        scale: 3,
                        comment: "Quantity of the movement",
                    },
                    {
                        name: "movement_reason",
                        type: "text",
                        comment: "Reason of the movement",
                        isNullable: true,
                    },
                    {
                        name: "related_doc",
                        type: "varchar",
                        length: "100",
                        comment: "Related document of the movement",
                        isNullable: true,
                    },
                    {
                        name: "updated_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                    {
                        name: "user_id",
                        type: "int",
                        unsigned: true,
                        comment: "User ID who made this change",
                    }
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'inv_lot_id',
            columnNames: ['inv_lot_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'movement_type',
            columnNames: ['movement_type']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'user_id_related_doc',
            columnNames: ['user_id', 'related_doc']
        }))

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["id_inv_storage"],
                referencedColumnNames: ["id_inv_storage"],
                referencedTableName: "inventory_storages",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )

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
        const foreignKeyStorage = table.foreignKeys.find(fk => fk.columnNames.indexOf("id_inv_storage") !== -1);
        const foreignKeyVariant = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_var_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyStorage);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyVariant);

        await queryRunner.dropIndex(this.table_name, 'user_id_related_doc');
        await queryRunner.dropIndex(this.table_name, 'movement_type');
        await queryRunner.dropIndex(this.table_name, 'inv_lot_id');
        await queryRunner.dropTable(this.table_name);
    }

}
