const { MigrationInterface, QueryRunner, Table, TableIndex } = require("typeorm");

module.exports = class InitialUsers1692245023178 {
    name = 'InitialUsers1692245023178'
    table_name = 'Users';

    async up(queryRunner) {
        await queryRunner.createTable(new Table({
            name: this.table_name,
            columns: [
                {
                    name: "id",
                    type: "int",
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: "increment",
                    comment: "id incremental del usuario"
                },
                {
                    name: "ip_address",
                    type: "varchar",
                    length: "20",
                    comment: "ip login"
                },
                {
                    name: "user_type",
                    type: "tinyint",
                    default: 2,
                    length: 1,
                    comment: "1 user api, 2 user web, 3 user pos, 4 user app"
                },
                {
                    name: "username",
                    type: "varchar",
                    length: "50",
                    isNullable: false,
                    isUnique: true,
                    comment: "username to login"
                },
                {
                    name: "password",
                    type: "varchar",
                    length: "150",
                    isNullable: false,
                    comment: "password to login"
                },
                {
                    name: "user_status",
                    type: "tinyint",
                    default: 1,
                    length: 1,
                    comment: "1 activo, 0 inactivo"
                },
                {
                    name: "email",
                    type: "varchar",
                    length: "150",
                    isNullable: false,
                    isUnique: true,
                    comment: "email to contact or reset login"
                },
                {
                    name: "first_name",
                    type: "varchar",
                    length: "50",
                    isNullable: false,
                    comment: "user first name"
                },
                {
                    name: "last_name",
                    type: "varchar",
                    length: "50",
                    comment: "user lastname"
                },
                {
                    name: "user_phone",
                    type: "varchar",
                    length: "20",
                    comment: "user phone number",
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
                    name: "last_login",
                    type: "datetime",
                    isNullable: false,
                    default: "CURRENT_TIMESTAMP" 
                },
                {
                    name: "access_token",
                    type: "varchar",
                    length: "150",
                    comment: "access token login",
                },
                {
                    name: "refresh_token",
                    type: "varchar",
                    length: "150",
                    comment: "refresh token login",
                },
                {
                    name: "is_admin",
                    type: "tinyint",
                    default: 0,
                    comment: "1 es user admin, 0 no es user admin"
                },
            ],
        }), true);

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'user_type_username',
            columnNames: ['user_type', 'username']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'user_status_username',
            columnNames: ['user_status', 'username']
        }))

        await queryRunner.createIndex(this.table_name, new TableIndex({
            name: 'first_name',
            columnNames: ['first_name']
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropIndex(this.table_name, 'first_name');
        await queryRunner.dropIndex(this.table_name, 'user_type_username');
        await queryRunner.dropIndex(this.table_name, 'user_status_username');
        await queryRunner.dropTable(this.table_name);
    }
}
