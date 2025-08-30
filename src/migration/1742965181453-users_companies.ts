import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class UsersCompanies_1742965181453 implements MigrationInterface {

    table_name = 'users_companies';
            
    public async up(queryRunner: QueryRunner): Promise<void> {
        const isTest = process.env.NODE_ENV === 'test';

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "user_company_id",
                        type: isTest ? "integer" : "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                        ...(isTest ? {} : { unsigned: true })
                    },
                    {
                        name: "user_id",
                        type: "int",
                        unsigned: true,
                        comment: "id del usuario"
                    },
                    {
                        name: "company_id",
                        type: "int",
                        unsigned: true,
                        comment: "id de la empresa"
                    },
                    {
                        name: "is_company_admin",
                        type: "tinyint",
                        default: 0,
                        width: 1,
                        comment: "Si es o no user admin de la empresa"
                    },
                    {
                        name: "created_at",
                        type: "datetime",
                        default: "CURRENT_TIMESTAMP",
                    },
                ]
            }),
            true,
        );

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_user_id',
            columnNames: ['user_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_company_id',
            columnNames: ['company_id']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'idx_user_company',
            columnNames: ['user_id', 'company_id']
        }))

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["user_id"],
                referencedColumnNames: ["user_id"],
                referencedTableName: "users",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )

        await queryRunner.createForeignKey(
            this.table_name,
            new TableForeignKey({
                columnNames: ["company_id"],
                referencedColumnNames: ["company_id"],
                referencedTableName: "companies",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable(this.table_name);
        const foreignKeyCompany = table.foreignKeys.find(fk => fk.columnNames.indexOf("company_id") !== -1);
        const foreignKeyUser = table.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyUser);

        await queryRunner.dropIndex(this.table_name, 'idx_user_company');
        await queryRunner.dropIndex(this.table_name, 'idx_company_id');
        await queryRunner.dropIndex(this.table_name, 'idx_user_id');
        await queryRunner.dropTable(this.table_name);
    }

}
