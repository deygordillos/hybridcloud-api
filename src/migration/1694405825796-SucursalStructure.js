const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class SucursalStructure1694405825796 {
    name = 'SucursalStructure1694405825796'
    table_name = 'Sucursales';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "sucursal_id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                    comment: "id incremental de la sucursal"
                },
                {
                    name: "sucursal_name",
                    type: "varchar",
                    length: "50",
                    comment: "nombre de la sucursal"
                },
                {
                    name: "sucursal_status",
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
                    name: "sucursal_color",
                    type: "varchar",
                    length: "7",
                    comment: "hexadecimal de la sucursal",
                    isNullable: true
                },
                {
                    name: "sucursal_razon_social",
                    type: "varchar",
                    length: "200",
                    comment: "razon social de la sucursal"
                },
                {
                    name: "sucursal_slug",
                    type: "varchar",
                    length: "30",
                    comment: "slug de busqueda de la sucursal",
                    isUnique: true
                },
                {
                    name: "sucursal_id_fiscal",
                    type: "varchar",
                    length: "30",
                    comment: "rif de la sucursal",
                    isUnique: true
                },
                {
                    name: "sucursal_email",
                    type: "varchar",
                    length: "100",
                    comment: "correo de la sucursal"
                },
                {
                    name: "sucursal_phone",
                    type: "varchar",
                    length: "20",
                    comment: "telefono de la sucursal"
                },
                {
                    name: "sucursal_phone2",
                    type: "varchar",
                    length: "20",
                    comment: "telefono 2 de la sucursal",
                    isNullable: true
                },
                {
                    name: "sucursal_website",
                    type: "varchar",
                    length: "200",
                    comment: "url de la sucursal",
                    isNullable: true
                },
                {
                    name: "sucursal_facebook",
                    type: "varchar",
                    length: "200",
                    comment: "url facebook de la sucursal",
                    isNullable: true
                },
                {
                    name: "sucursal_instagram",
                    type: "varchar",
                    length: "200",
                    comment: "url instagram de la sucursal",
                    isNullable: true
                },
                {
                    name: "sucursal_url_logo",
                    type: "varchar",
                    length: "200",
                    comment: "url logo de la sucursal",
                    isNullable: true
                },
                {
                    name: "sucursal_contact_name",
                    type: "varchar",
                    length: "50",
                    comment: "contacto de la sucursal",
                    isNullable: true
                },
                {
                    name: "sucursal_contact_phone",
                    type: "varchar",
                    length: "20",
                    comment: "telefono contacto de la sucursal",
                    isNullable: true
                },
                {
                    name: "sucursal_contact_email",
                    type: "varchar",
                    length: "100",
                    comment: "correo contacto de la sucursal",
                    isNullable: true
                },
                {
                    name: "company_id",
                    type: "int",
                    comment: "id la empresa"
                }
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'sucursal_status_name',
            columnNames: ['sucursal_status', 'sucursal_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_id',
            columnNames: ['company_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'sucursal_slug',
            columnNames: ['sucursal_slug']
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'sucursal_status_name');
        await queryRunner.dropIndex(this.table_name, 'company_id');
        await queryRunner.dropIndex(this.table_name, 'sucursal_slug');
        await queryRunner.dropTable(this.table_name);
    }
}
