const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class Rel_Users_Sucursales1697084812443 {
    name = 'Rel_Users_Sucursales1697084812443'
    table_name = 'Rel_Users_Sucursales';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP",
                },
                {
                    name: "user_id",
                    type: "int",
                    comment: "id usuario"
                },
                {
                    name: "sucursal_id",
                    type: "int",
                    comment: "id sucursal"
                }
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_user_id',
            columnNames: ['user_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_sucursal_id',
            columnNames: ['sucursal_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_user_sucursal',
            columnNames: ['user_id', 'sucursal_id'],
            isUnique: true
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'idx_user_sucursal');
        await queryRunner.dropIndex(this.table_name, 'idx_sucursal_id');
        await queryRunner.dropIndex(this.table_name, 'idx_user_id');
        await queryRunner.dropTable(this.table_name);
    }
}
