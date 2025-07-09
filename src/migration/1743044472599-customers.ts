import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class Customers_1743044472599 implements MigrationInterface {

    table_name = 'Customers';
            
    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "cust_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "company_id",
                        type: "int",
                        unsigned: true
                    },
                    {
                        name: "cust_code",
                        type: "varchar",
                        length: "30",
                        comment: "código de la empresa"
                    },
                    {
                        name: "cust_id_fiscal",
                        type: "varchar",
                        length: "30",
                        comment: "id fiscal de la empresa"
                    },
                    {
                        name: "cust_status",
                        type: "tinyint",
                        default: 1,
                        width: 1,
                        comment: "1 activo, 0 inactivo"
                    },
                    {
                        name: "cust_description",
                        type: "varchar",
                        length: "30",
                        comment: "nombre o descripción de la empresa"
                    },
                    {
                        name: "cust_address",
                        type: "varchar",
                        length: "200",
                        isNullable: true,
                        comment: "dirección de la empresa"
                    },
                    {
                        name: "cust_address_complement",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                        comment: "complemento de la dirección de la empresa"
                    },
                    {
                        name: "cust_address_city",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                        comment: "ciudad dirección de la empresa"
                    },
                    {
                        name: "cust_address_state",
                        type: "varchar",
                        length: "100",
                        isNullable: true,
                        comment: "estado de la dirección de la empresa"
                    },
                    {
                        name: "cust_exempt",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "exento de impuestos 1 si 0 no"
                    },
                    {
                        name: "cust_email",
                        type: "varchar",
                        length: "200",
                        isNullable: true,
                        comment: "correo de la empresa"
                    },
                    {
                        name: "cust_telephone1",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                        comment: "telefono contacto 1 de la empresa"
                    },
                    {
                        name: "cust_telephone2",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                        comment: "telefono contacto 2 de la empresa"
                    },
                    {
                        name: "cust_cellphone",
                        type: "varchar",
                        length: "20",
                        isNullable: true,
                        comment: "celular contacto de la empresa"
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
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'company_code_idfiscal',
            columnNames: ['company_id', 'cust_code', 'cust_id_fiscal']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'cust_description',
            columnNames: ['cust_description']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'cust_status',
            columnNames: ['cust_status']
        }))

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["company_id"],
                referencedColumnNames: ["company_id"],
                referencedTableName: "Companies",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("company_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);

        await queryRunner.dropIndex(this.table_name, 'cust_status');
        await queryRunner.dropIndex(this.table_name, 'cust_description');
        await queryRunner.dropIndex(this.table_name, 'company_code_idfiscal');
        await queryRunner.dropTable(this.table_name);
    }

}
