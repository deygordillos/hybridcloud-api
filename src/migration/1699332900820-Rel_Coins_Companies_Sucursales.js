const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class Rel_Coins_Companies_Sucursal1699332900820 {
    name = 'Rel_Coins_Companies_Sucursal1699332900820'
    table_name = 'Rel_Coins_Companies_Sucursal';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "id_coin_company_sucursal",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                    comment: "id relacional de la moneda de la empresa para sucursal"
                },
                {
                    name: "id_coin_company",
                    type: "int",
                    comment: "id de la relacion moneda empresa"
                },
                {
                    name: "sucursal_id",
                    type: "int",
                    comment: "id de la sucursal"
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP",
                }
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_id_coin_company',
            columnNames: ['id_coin_company']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_id_sucursal',
            columnNames: ['sucursal_id']
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'idx_id_sucursal');
        await queryRunner.dropIndex(this.table_name, 'idx_id_coin_company');
        await queryRunner.dropTable(this.table_name);
    }
}
