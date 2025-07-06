import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryVariantsAttrs_1751747115352 implements MigrationInterface {

    table_name = 'inventory_variants_attrs';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_varattr_id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        unsigned: true,
                        generationStrategy: "increment"
                    },
                    {
                        name: "inv_var_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "inv_attrval_id",
                        type: "int",
                        unsigned: true
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

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["inv_attrval_id"],
                referencedColumnNames: ["inv_attrval_id"],
                referencedTableName: "inventory_attrs_values",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_attrval_id") !== -1);
        const foreignKeyCompany2 = table.foreignKeys.find(fk => fk.columnNames.indexOf("inv_var_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany2);

        await queryRunner.dropTable(this.table_name);
    }

}
