import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class Companies_1742758897231 implements MigrationInterface {

    table_name = 'Companies';
        
    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "company_id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        unsigned: true,
                        generationStrategy: "increment",
                        comment: "id incremental de la empresa"
                    },
                    {
                        name: "group_id",
                        type: "int",
                        unsigned: true,
                        comment: "id del grupo empresarial"
                    },
                    {
                        name: "company_is_principal",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "1 es principal, 0 no es empresa principal del grupo"
                    },
                    {
                        name: "company_name",
                        type: "varchar",
                        length: "50",
                        isUnique: true,
                        comment: "nombre de la empresa"
                    },
                    {
                        name: "company_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
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
                        comment: "razon social de la empresa",
                        isNullable: true
                    },
                    {
                        name: "company_slug",
                        type: "varchar",
                        length: "100",
                        comment: "slug de busqueda de la empresa",
                        isNullable: true
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
                        comment: "correo de la empresa",
                        isNullable: true
                    },
                    {
                        name: "company_address",
                        type: "varchar",
                        length: "100",
                        comment: "dirección de la empresa",
                        isNullable: true
                    },
                    {
                        name: "company_phone1",
                        type: "varchar",
                        length: "20",
                        comment: "telefono de la empresa",
                        isNullable: true
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
                        comment: "base de datos de la empresa",
                        default: null,
                        isNullable: true
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
                        name: "company_start",
                        type: "date",
                        comment: "fecha de inicio de la licencia"
                    },
                    {
                        name: "company_end",
                        type: "date",
                        comment: "fecha de fin de la licencia"
                    },
                    {
                        name: "country_id",
                        type: "int",
                        unsigned: true,
                        comment: "id del pais donde esta la empresa"
                    },
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_status_name',
            columnNames: ['company_status', 'company_name']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_slug',
            columnNames: ['company_slug']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_razon_social',
            columnNames: ['company_razon_social']
        }))

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["group_id"],
                referencedColumnNames: ["group_id"],
                referencedTableName: "Groups",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["country_id"],
                referencedColumnNames: ["country_id"],
                referencedTableName: "Countries",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyGroup = table.foreignKeys.find(fk => fk.columnNames.indexOf("group_id") !== -1);
        const foreignKeyCountry = table.foreignKeys.find(fk => fk.columnNames.indexOf("country_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyGroup);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCountry);

        await queryRunner.dropIndex(this.table_name, 'company_razon_social');
        await queryRunner.dropIndex(this.table_name, 'company_slug');
        await queryRunner.dropIndex(this.table_name, 'company_status_name');
        await queryRunner.dropTable(this.table_name);
    }

}
