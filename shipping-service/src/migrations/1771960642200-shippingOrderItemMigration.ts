import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ShippingOrderItemMigration1771960642200 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "shipping_orders_item",
        columns: [
          {
            name: "order_id",
            type: "uuid",
            isPrimary: true,
          },
          {
            name: "products",
            type: "json",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "now()",
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("shipping_orders_item");
  }
}