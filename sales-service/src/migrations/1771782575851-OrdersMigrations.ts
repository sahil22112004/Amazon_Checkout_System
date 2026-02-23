import { MigrationInterface, QueryRunner,Table } from "typeorm";

export class OrdersMigrations1771782575851 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'orderId',
            type: 'uuid',
            isPrimary: true,
          },
          {
            name: 'customerId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'products',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'orderTotal',
            type: 'decimal',
            isNullable: false,
          },
          {
            name: 'status',
            type: 'enum',
            enum: [
              'PENDING',
              'PLACED',
              'PAYMENT_FAILED',
              'BILLED',
              'READY_TO_SHIP',
              'CANCELED',
            ],
            default: `'PENDING'`,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}