const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class Rel_Coins_Companies1698290703211 {
    name = 'Rel_Coins_Companies1698290703211'
    table_name = 'Rel_Coins_Companies';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "id_coin_company",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                    comment: "id relacional de la moneda y empresa"
                },
                {
                    name: "coin_id",
                    type: "int",
                    comment: "id de la moneda"
                },
                {
                    name: "company_id",
                    type: "int",
                    comment: "id de la empresa"
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
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP",
                }
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_coin_id',
            columnNames: ['coin_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_company_id',
            columnNames: ['company_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_coin_id_company',
            columnNames: ['coin_id', 'company_id'],
            isUnique: true
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'idx_coin_id_company');
        await queryRunner.dropIndex(this.table_name, 'idx_company_id');
        await queryRunner.dropIndex(this.table_name, 'idx_coin_id');
        await queryRunner.dropTable(this.table_name);
    }
}
