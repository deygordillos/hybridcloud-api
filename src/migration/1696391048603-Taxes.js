const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class Taxes1696391048603 {
    name = 'Taxes1696391048603'
    table_name = 'Taxes';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "tax_id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                    comment: "id del tax de la sucursal"
                },
                {
                    name: "tax_code",
                    type: "varchar",
                    length: "10",
                    comment: "codigo del impuesto"
                },
                {
                    name: "tax_description",
                    type: "varchar",
                    length: "80",
                    isNullable: true,
                    comment: "descripcion del impuesto"
                },
                {
                    name: "tax_status",
                    type: "tinyint",
                    default: 1,
                    length: 1,
                    comment: "1 activo, 0 inactivo"
                },
                {
                    name: "tax_siglas",
                    type: "varchar",
                    length: "150",
                    isNullable: true,
                    comment: "siglas del impuesto"
                },
                {
                    name: "tax_type",
                    type: "tinyint",
                    default: 2,
                    length: 1,
                    comment: "1 exento, 2 afecto"
                },
                {
                    name: "tax_percentage",
                    type: "int",
                    length: 3,
                    comment: "porcentaje de impuesto"
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
                    name: "tax_affects_cost",
                    type: "tinyint",
                    default: 0,
                    comment: "Afecta costo. 1 si, 0 no"
                },
                {
                    name: "company_id",
                    type: "int",
                    comment: "id la empresa"
                }
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'tax_company_status_code',
            columnNames: ['company_id', 'tax_status', 'tax_code']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_id_code',
            columnNames: ['company_id', 'tax_code']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_id',
            columnNames: ['company_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'tax_type',
            columnNames: ['tax_type']
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'tax_type');
        await queryRunner.dropIndex(this.table_name, 'company_id');
        await queryRunner.dropIndex(this.table_name, 'company_id_code');
        await queryRunner.dropIndex(this.table_name, 'tax_company_status_code');
        await queryRunner.dropTable(this.table_name);
    }
}
