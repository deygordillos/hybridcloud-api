import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class Groups_1742752459924 implements MigrationInterface {

    table_name = 'groups';
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        // Create tables
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "group_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        comment: "id incremental del grupo",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "group_name",
                        type: "varchar",
                        length: "50",
                        isUnique: true,
                        comment: "nombre del grupo"
                    },
                    {
                        name: "group_status",
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
                    {
                        name: "user_id",
                        type: "int",
                        unsigned: true,
                        comment: "id del usuario que creó el grupo"
                    },
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'group_status_name',
            columnNames: ['group_status', 'group_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'group_name',
            columnNames: ['group_name']
        }))

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "users",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKey = table.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKey);
        
        await queryRunner.dropIndex(this.table_name, 'group_name');
        await queryRunner.dropIndex(this.table_name, 'group_status_name');
        await queryRunner.dropTable(this.table_name);
    }

}
