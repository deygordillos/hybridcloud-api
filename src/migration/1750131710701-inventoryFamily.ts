import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryFamily_1750131710701 implements MigrationInterface {
    table_name = 'InventoryFamily';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "id_inv_family",
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
                        name: "inv_family_code",
                        type: "varchar",
                        length: "20",
                        comment: "código de la familia de productos"
                    },
                    {
                        name: "inv_family_name",
                        type: "varchar",
                        length: "80",
                        comment: "nombre de la familia de productos"
                    },
                    {
                        name: "inv_family_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 activo, 0 inactivo"
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
            columnNames: ['company_id', 'inv_family_code', 'inv_family_name']
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
