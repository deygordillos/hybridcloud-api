import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from "typeorm";

export class UsersCompanies_1742965181453 implements MigrationInterface {

    table_name = 'UsersCompanies';
            
    public async up(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.createTable(
            new Table({
                name: this.table_name,
                columns: [
                    {
                        name: "user_company_id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        unsigned: true,
                        generationStrategy: "increment"
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
                referencedTableName: "Users",
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            }),
        )

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
        const foreignKeyUser = table.foreignKeys.find(fk => fk.columnNames.indexOf("user_id") !== -1);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyCompany);
        await queryRunner.dropForeignKey(this.table_name, foreignKeyUser);

        await queryRunner.dropIndex(this.table_name, 'idx_user_company');
        await queryRunner.dropIndex(this.table_name, 'idx_company_id');
        await queryRunner.dropIndex(this.table_name, 'idx_user_id');
        await queryRunner.dropTable(this.table_name);
    }

}
