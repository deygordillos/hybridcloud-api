import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class Groups_1742752459924 implements MigrationInterface {

    table_name = 'Groups';
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "group_id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        comment: "id incremental del grupo"
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

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'user_id',
            columnNames: ['user_id']
        }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.table_name, 'user_id');
        await queryRunner.dropIndex(this.table_name, 'group_name');
        await queryRunner.dropIndex(this.table_name, 'group_status_name');
        await queryRunner.dropTable(this.table_name);
    }

}
