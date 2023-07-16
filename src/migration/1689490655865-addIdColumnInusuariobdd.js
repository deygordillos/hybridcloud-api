const { MigrationInterface, QueryRunner, TableColumn, TableIndex } = require("typeorm");

module.exports = class AddIdColumnInusuariobdd1689490655865 {
    name = 'AddIdColumnInusuariobdd1689490655865'

    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE \`usuariobdd\` DROP PRIMARY KEY`);
        
        await queryRunner.addColumn(
            "usuariobdd",
            new TableColumn({
                name: "id",
                type: "int",
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
                comment: 'pk autoincrement'
            })
        )

        await queryRunner.createIndex('usuariobdd', new TableIndex({
            name: 'perfil_estatus',
            columnNames: ['perfil', 'bdd']
        }))
    }

    async down(queryRunner) {
        await queryRunner.dropColumn('usuariobdd', 'id');
        await queryRunner.dropIndex('usuariobdd', 'perfil_estatus');
        await queryRunner.query(`ALTER TABLE \`usuariobdd\` ADD PRIMARY KEY(empresa, sucursal, usuario)`);
    }
}
