const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class TestCompany1696391048603 {
    name = 'TestCompany1696391048603'

    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`Test\` (\`test_id\` int NOT NULL AUTO_INCREMENT COMMENT 'id test', PRIMARY KEY (\`test_id\`)) ENGINE=InnoDB`);
    }

    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`Test\``);
    }
}
