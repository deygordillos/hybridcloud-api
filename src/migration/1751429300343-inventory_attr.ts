import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class InventoryAttrs_1751429300343 implements MigrationInterface {

    table_name = 'inventory_attrs';
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "inv_attr_id",
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
                        name: "attr_name",
                        type: "varchar",
                        length: "50",
                        comment: "name of the inventory attribute",
                    },
                    {
                        name: "attr_description",
                        type: "varchar",
                        length: "150",
                        isNullable: true,
                        comment: "description of the inventory attribute",
                    },
                    {
                        name: "attr_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 active, 0 inactive"
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
            name: 'company_attr_name',
            isUnique: true,
            columnNames: ['company_id', 'attr_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'attr_status',
            columnNames: ['attr_status']
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

        await queryRunner.dropIndex(this.table_name, 'attr_status');
        await queryRunner.dropIndex(this.table_name, 'company_attr_name');
        await queryRunner.dropTable(this.table_name);
    }

}
