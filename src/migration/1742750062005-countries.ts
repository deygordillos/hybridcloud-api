import { MigrationInterface, QueryRunner, Table, TableIndex } from "typeorm";

export class Countries_1742750062005 implements MigrationInterface {
    table_name = 'Countries';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create tables
        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "country_id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        unsigned: true,
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
                        comment: "nombre del pais"
                    },
                    {
                        name: "country_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
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
                ]
            }),
            true,
        );

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

        await queryRunner.query(`INSERT INTO ${this.table_name} (\`country_iso2\`, \`country_iso3\`, \`prefix_cellphone\`, \`country_name\`, \`min_id_fiscal\`, \`nombre_id_fiscal\`, \`continent_name\`, \`subcontinent_name\`, \`country_iso_coin\`, \`country_iso_coin_name\`, \`country_coin_name\`, \`country_coin_symbol_name\`)  
        VALUES (:iso2, :iso3, :prefix, :country_name, :min_id_fiscal, :nombre_id_fiscal, :continent_name, :subcontinent_name, :country_iso_coin, :country_iso_coin_name, :country_coin_name, :country_coin_symbol_name)`,
        [{
            iso2: 'VE',
            iso3: 'VEN',
            prefix: '58',
            country_name: 'Venezuela',
            min_id_fiscal: 'RIF',
            nombre_id_fiscal: 'Registro de Información Fiscal',
            continent_name: 'América',
            subcontinent_name: 'América del Sur',
            country_iso_coin: 'VES',
            country_iso_coin_name: 'Bolívar Soberano',
            country_coin_name: 'Bolívar',
            country_coin_symbol_name: 'Bs.S'
        }]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropIndex(this.table_name, 'country_status_name');
        await queryRunner.dropIndex(this.table_name, 'country_iso2');
        await queryRunner.dropIndex(this.table_name, 'country_iso3');
        await queryRunner.dropIndex(this.table_name, 'continent_name');
        await queryRunner.dropIndex(this.table_name, 'subcontinent_name');
        await queryRunner.dropTable(this.table_name);
    }

}
