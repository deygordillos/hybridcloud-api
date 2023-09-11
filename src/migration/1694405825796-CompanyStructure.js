const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class CompanyStructure1694405825796 {
    name = 'CompanyStructure1694405825796'
    table_name = 'Companies';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "company_id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                    comment: "id incremental de la empresa"
                },
                {
                    name: "company_name",
                    type: "varchar",
                    length: "50",
                    comment: "nombre de la empresa"
                },
                {
                    name: "company_status",
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
                    name: "company_color",
                    type: "varchar",
                    length: "7",
                    comment: "hexadecimal de la empresa",
                    isNullable: true
                },
                {
                    name: "company_razon_social",
                    type: "varchar",
                    length: "200",
                    comment: "razon social de la empresa"
                },
                {
                    name: "company_slug",
                    type: "varchar",
                    length: "30",
                    comment: "slug de busqueda de la empresa",
                    isUnique: true
                },
                {
                    name: "company_id_fiscal",
                    type: "varchar",
                    length: "30",
                    comment: "rif de la empresa",
                    isUnique: true
                },
                {
                    name: "company_email",
                    type: "varchar",
                    length: "100",
                    comment: "correo de la empresa"
                },
                {
                    name: "company_phone",
                    type: "varchar",
                    length: "20",
                    comment: "telefono de la empresa"
                },
                {
                    name: "company_phone2",
                    type: "varchar",
                    length: "20",
                    comment: "telefono 2 de la empresa",
                    isNullable: true
                },
                {
                    name: "company_website",
                    type: "varchar",
                    length: "200",
                    comment: "url de la empresa",
                    isNullable: true
                },
                {
                    name: "company_facebook",
                    type: "varchar",
                    length: "200",
                    comment: "url facebook de la empresa",
                    isNullable: true
                },
                {
                    name: "company_instagram",
                    type: "varchar",
                    length: "200",
                    comment: "url instagram de la empresa",
                    isNullable: true
                },
                {
                    name: "company_database",
                    type: "varchar",
                    length: "100",
                    comment: "base de datos de la empresa"
                },
                {
                    name: "company_url_logo",
                    type: "varchar",
                    length: "200",
                    comment: "url logo de la empresa",
                    isNullable: true
                },
                {
                    name: "company_contact_name",
                    type: "varchar",
                    length: "50",
                    comment: "contacto de la empresa",
                    isNullable: true
                },
                {
                    name: "company_contact_phone",
                    type: "varchar",
                    length: "20",
                    comment: "telefono contacto de la empresa",
                    isNullable: true
                },
                {
                    name: "company_contact_email",
                    type: "varchar",
                    length: "100",
                    comment: "correo contacto de la empresa",
                    isNullable: true
                },
                {
                    name: "country_id",
                    type: "int",
                    comment: "id del pais donde esta la empresa"
                },
                {
                    name: "group_id",
                    type: "int",
                    comment: "id del grupo empresarial"
                }
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_status_name',
            columnNames: ['company_status', 'company_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'group_id',
            columnNames: ['group_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'country_id',
            columnNames: ['country_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_slug',
            columnNames: ['company_slug']
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'company_status_name');
        await queryRunner.dropIndex(this.table_name, 'group_id');
        await queryRunner.dropIndex(this.table_name, 'country_id');
        await queryRunner.dropIndex(this.table_name, 'company_slug');
        await queryRunner.dropTable(this.table_name);
    }
}
