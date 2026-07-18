import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class OrderItems_1784345470585 implements MigrationInterface {

    table_name = 'order_items';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        const decimalCol = (name: string, comment?: string) => ({
            name,
            type: "decimal",
            precision: 18,
            scale: 3,
            default: 0,
            ...(comment ? { comment } : {})
        });

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "order_item_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    { name: "order_id", type: "int", unsigned: true },
                    { name: "inv_var_id", type: "int", unsigned: true },
                    { name: "inv_price_id", type: "int", unsigned: true, isNullable: true, comment: "Precio origen para trazabilidad" },
                    { name: "quantity", type: "decimal", precision: 18, scale: 3 },
                    decimalCol("price_unit_local"),
                    decimalCol("price_unit_stable"),
                    decimalCol("price_unit_ref"),
                    { name: "discount_percent", type: "decimal", precision: 5, scale: 2, default: 0 },
                    decimalCol("discount_amount_local"),
                    decimalCol("discount_amount_stable"),
                    decimalCol("discount_amount_ref"),
                    decimalCol("tax_amount_local"),
                    decimalCol("tax_amount_stable"),
                    decimalCol("tax_amount_ref"),
                    decimalCol("total_local"),
                    decimalCol("total_stable"),
                    decimalCol("total_ref"),
                    { name: "item_notes", type: "varchar", length: "255", isNullable: true },
                    { name: "created_at", type: "datetime", default: "CURRENT_TIMESTAMP" },
                    { name: "updated_at", type: "datetime", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" },
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_order_items_order',
            columnNames: ['order_id']
        }));
        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_order_items_variant',
            columnNames: ['inv_var_id']
        }));

        await queryRunner.createForeignKey(this.table_name, new TableForeignKey({
            columnNames: ["order_id"],
            referencedColumnNames: ["order_id"],
            referencedTableName: "orders",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey(this.table_name, new TableForeignKey({
            columnNames: ["inv_var_id"],
            referencedColumnNames: ["inv_var_id"],
            referencedTableName: "inventory_variants",
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        }));
        await queryRunner.createForeignKey(this.table_name, new TableForeignKey({
            columnNames: ["inv_price_id"],
            referencedColumnNames: ["inv_price_id"],
            referencedTableName: "inventory_prices",
            onUpdate: "CASCADE",
            onDelete: "SET NULL",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        if (table) {
            for (const foreignKey of table.foreignKeys) {
                await queryRunner.dropForeignKey(this.table_name, foreignKey);
            }
            await queryRunner.dropTable(this.table_name);
        }
    }

}
