const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class Countries1695355360977 {
    name = 'Countries1695355360977'
    table_name = 'Countries';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "country_id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                    comment: "id incremental del pais"
                },
                {
                    name: "country_iso2",
                    type: "varchar",
                    length: "3",
                    comment: "iso2 del pais"
                },
                {
                    name: "country_iso3",
                    type: "varchar",
                    length: "3",
                    comment: "iso3 del pais"
                },
                {
                    name: "prefix_cellphone",
                    type: "varchar",
                    length: "4",
                    comment: "prefijo numerico celular",
                    isNullable: true
                },
                {
                    name: "country_name",
                    type: "varchar",
                    length: "100",
                    comment: "prefijo numerico celular"
                },
                {
                    name: "country_status",
                    type: "tinyint",
                    default: 1,
                    length: 1,
                    comment: "1 activo, 0 inactivo"
                },
                {
                    name: "min_id_fiscal",
                    type: "varchar",
                    length: "5",
                    comment: "id fiscal",
                    isNullable: true
                },
                {
                    name: "nombre_id_fiscal",
                    type: "varchar",
                    length: "60",
                    comment: "nombre id fiscal",
                    isNullable: true
                },
                {
                    name: "country_language",
                    type: "varchar",
                    length: "20",
                    comment: "lenguaje oficial del pais",
                    isNullable: true
                },
                {
                    name: "continent_name",
                    type: "varchar",
                    length: "20",
                    comment: "continente",
                    isNullable: true
                },
                {
                    name: "subcontinent_name",
                    type: "varchar",
                    length: "40",
                    comment: "subcontinente",
                    isNullable: true
                },
                {
                    name: "country_iso_coin",
                    type: "varchar",
                    length: "3",
                    comment: "iso moneda",
                    isNullable: true
                },
                {
                    name: "country_iso_coin_name",
                    type: "varchar",
                    length: "100",
                    comment: "nombre iso moneda",
                    isNullable: true
                },
                {
                    name: "country_coin_name",
                    type: "varchar",
                    length: "100",
                    comment: "country moneda name",
                    isNullable: true
                },
                {
                    name: "country_coin_symbol_name",
                    type: "varchar",
                    length: "100",
                    comment: "country symbol moneda name",
                    isNullable: true
                },
                {
                    name: "mask_phone",
                    type: "varchar",
                    length: "100",
                    comment: "country mask_phone",
                    isNullable: true
                }
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'country_status_name',
            columnNames: ['country_status', 'country_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'country_iso2',
            columnNames: ['country_iso2']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'country_iso3',
            columnNames: ['country_iso3']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'continent_name',
            columnNames: ['continent_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'subcontinent_name',
            columnNames: ['subcontinent_name']
        }))

        await queryRunner.query(`INSERT INTO \`${this.table_name}\`
        (\`country_iso2\`, \`country_iso3\`, \`prefix_cellphone\`, \`country_name\`, \`min_id_fiscal\`, \`nombre_id_fiscal\`, \`continent_name\`, \`subcontinent_name\`, \`country_iso_coin\`, \`country_iso_coin_name\`, \`country_coin_name\`, \`country_coin_symbol_name\`)  
        VALUES 
        ('VE', 'VEN', '58', 'Venezuela', 'RIF', 'Registro de Información Fiscal', 'América', 'América del Sur', 'VES', 'Bolívar Soberano', 'Bolívar', 'Bs.S')`);
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'country_status_name');
        await queryRunner.dropIndex(this.table_name, 'country_iso2');
        await queryRunner.dropIndex(this.table_name, 'country_iso3');
        await queryRunner.dropIndex(this.table_name, 'continent_name');
        await queryRunner.dropIndex(this.table_name, 'subcontinent_name');
        await queryRunner.dropTable(this.table_name);
    }
}
