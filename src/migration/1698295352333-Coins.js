const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class Coins1698295352333 {
    name = 'Coins1698295352333'
    table_name = 'Coins';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "coin_id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                    comment: "id incremental de la moneda"
                },
                {
                    name: "coin_name",
                    type: "varchar",
                    length: "20",
                    comment: "nombre de la moneda"
                },
                {
                    name: "coin_symbol",
                    type: "varchar",
                    length: "5",
                    comment: "simbolo de la moneda",
                    isNullable: true
                },
                {
                    name: "coin_status",
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
                    name: "coin_factor",
                    type: "decimal",
                    default: 1,
                    comment: "factor de conversión",
                    precision: 10,
                    scale: 6
                },
                {
                    name: "coin_iso3",
                    type: "varchar",
                    length: "5",
                    comment: "iso3 de la moneda",
                    isNullable: true
                },
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_coin_status',
            columnNames: ['coin_status']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_coin_status_name',
            columnNames: ['coin_status', 'coin_name']
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'idx_coin_status_name');
        await queryRunner.dropIndex(this.table_name, 'idx_coin_status');
        await queryRunner.dropTable(this.table_name);
    }
}
