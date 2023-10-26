const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class Rel_Taxes_Sucursales1698290703211 {
    name = 'Rel_Taxes_Sucursales1698290703211'
    table_name = 'Rel_Taxes_Sucursales';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "tax_id_sucursal",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment"
                },
                {
                    name: "tax_id",
                    type: "int",
                    comment: "id tax de la empresa"
                },
                {
                    name: "sucursal_id",
                    type: "int",
                    comment: "id sucursal"
                },
                {
                    name: "created_at",
                    type: "datetime",
                    default: "CURRENT_TIMESTAMP",
                }
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_tax_id',
            columnNames: ['tax_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_sucursal_id',
            columnNames: ['sucursal_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_tax_id_sucursal',
            columnNames: ['tax_id', 'sucursal_id'],
            isUnique: true
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'idx_tax_id_sucursal');
        await queryRunner.dropIndex(this.table_name, 'idx_sucursal_id');
        await queryRunner.dropIndex(this.table_name, 'idx_tax_id');
        await queryRunner.dropTable(this.table_name);
    }
}
