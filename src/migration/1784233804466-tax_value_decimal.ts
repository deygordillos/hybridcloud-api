import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

/**
 * Cambia tax_value de float(5,2) a decimal(18,3) para soportar impuestos
 * de monto fijo grandes (p.ej. montos en VES) sin pérdida de precisión.
 */
export class TaxValueDecimal_1784233804466 implements MigrationInterface {
    table_name = 'taxes';
    
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(this.table_name, "tax_value", new TableColumn({
            name: "tax_value",
            type: "decimal",
            precision: 18,
            scale: 3,
            default: 0,
            comment: "tax value",
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(this.table_name, "tax_value", new TableColumn({
            name: "tax_value",
            type: "float",
            precision: 5,
            scale: 2,
            default: 0,
            comment: "tax value",
        }));
    }
}
