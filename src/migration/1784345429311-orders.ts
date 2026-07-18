import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class Orders_1784345429311 implements MigrationInterface {

    table_name = 'orders';

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
                        name: "order_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    { name: "company_id", type: "int", unsigned: true },
                    { name: "order_code", type: "varchar", length: "20", comment: "Correlativo del pedido por empresa" },
                    { name: "cust_id", type: "int", unsigned: true },
                    { name: "user_id", type: "int", unsigned: true, comment: "Vendedor / usuario que registró el pedido" },
                    { name: "id_inv_storage", type: "int", unsigned: true, isNullable: true, comment: "Depósito de despacho" },
                    { name: "order_status", type: "tinyint", width: 1, default: 1, comment: "1 borrador, 2 confirmado, 3 despachado, 4 facturado, 5 cancelado" },
                    { name: "order_date", type: "datetime" },
                    { name: "currency_id_local", type: "int", unsigned: true, isNullable: true },
                    { name: "currency_id_stable", type: "int", unsigned: true, isNullable: true },
                    { name: "currency_id_ref", type: "int", unsigned: true, isNullable: true },
                    { name: "exchange_rate_stable", type: "decimal", precision: 18, scale: 8, isNullable: true },
                    { name: "exchange_rate_ref", type: "decimal", precision: 18, scale: 8, isNullable: true },
                    { name: "exchange_method", type: "tinyint", width: 1, default: 2 },
                    decimalCol("subtotal_local"),
                    decimalCol("subtotal_stable"),
                    decimalCol("subtotal_ref"),
                    decimalCol("discount_total_local"),
                    decimalCol("discount_total_stable"),
                    decimalCol("discount_total_ref"),
                    decimalCol("tax_total_local"),
                    decimalCol("tax_total_stable"),
                    decimalCol("tax_total_ref"),
                    decimalCol("total_local"),
                    decimalCol("total_stable"),
                    decimalCol("total_ref"),
                    { name: "order_notes", type: "varchar", length: "500", isNullable: true },
                    { name: "confirmed_at", type: "datetime", isNullable: true },
                    { name: "dispatched_at", type: "datetime", isNullable: true },
                    { name: "invoiced_at", type: "datetime", isNullable: true },
                    { name: "cancelled_at", type: "datetime", isNullable: true },
                    { name: "created_by", type: "int", unsigned: true, isNullable: true },
                    { name: "updated_by", type: "int", unsigned: true, isNullable: true },
                    { name: "created_at", type: "datetime", default: "CURRENT_TIMESTAMP" },
                    { name: "updated_at", type: "datetime", default: "CURRENT_TIMESTAMP", onUpdate: "CURRENT_TIMESTAMP" },
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_order_code',
            columnNames: ['company_id', 'order_code'],
            isUnique: true
        }));
        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_orders_status',
            columnNames: ['order_status']
        }));
        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_orders_cust',
            columnNames: ['cust_id']
        }));
        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_orders_date',
            columnNames: ['company_id', 'order_date']
        }));

        await queryRunner.createForeignKey(this.table_name, new TableForeignKey({
            columnNames: ["company_id"],
            referencedColumnNames: ["company_id"],
            referencedTableName: "companies",
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        }));
        await queryRunner.createForeignKey(this.table_name, new TableForeignKey({
            columnNames: ["cust_id"],
            referencedColumnNames: ["cust_id"],
            referencedTableName: "customers",
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        }));
        await queryRunner.createForeignKey(this.table_name, new TableForeignKey({
            columnNames: ["user_id"],
            referencedColumnNames: ["user_id"],
            referencedTableName: "users",
            onUpdate: "CASCADE",
            onDelete: "RESTRICT",
        }));
        await queryRunner.createForeignKey(this.table_name, new TableForeignKey({
            columnNames: ["id_inv_storage"],
            referencedColumnNames: ["id_inv_storage"],
            referencedTableName: "inventory_storages",
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
