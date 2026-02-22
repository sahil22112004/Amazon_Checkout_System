import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class OrderItemsMigrations1771782588117 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    
        await queryRunner.createTable(
            new Table({
                name: "order_items",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "productId",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "quantity",
                        type: "int",
                        isNullable: false,
                    },
                    {
                        name: "price",
                        type: "numeric",
                        precision: 12,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "orderId",
                        type: "uuid",
                        isNullable: false,
                    },
                ],
            }),
            true
        );

        await queryRunner.createForeignKey(
            "sales.order_items",
            new TableForeignKey({
                columnNames: ["orderId"],
                referencedSchema: "sales",
                referencedTableName: "orders",
                referencedColumnNames: ["id"],
                onDelete: "CASCADE",
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("sales.order_items");
    }
}