import { MigrationInterface, QueryRunner,Table } from "typeorm";

export class ShiipingOrderMigration1771958750548 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'shipping_orders',
        columns: [
          {
            name: 'order_id',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'shipping_address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shipping_orders');
  }
}