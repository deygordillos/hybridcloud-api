const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class GroupStructure1694405825796 {
    name = 'GroupStructure1694405825796'
    table_name = 'Groups';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
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
                    comment: "nombre del grupo"
                },
                {
                    name: "group_status",
                    type: "tinyint",
                    default: 1,
                    length: 1,
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
                    name: "created_by",
                    type: "int",
                    default: 0,
                    comment: "id del usuario que creó el grupo"
                },
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'group_status_name',
            columnNames: ['group_status', 'group_name']
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'group_status_name');
        await queryRunner.dropTable(this.table_name);
    }
}
