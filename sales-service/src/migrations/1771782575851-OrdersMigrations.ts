import { MigrationInterface, QueryRunner,Table } from "typeorm";

export class OrdersMigrations1771782575851 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.createTable(
            new Table({
                name: "orders",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "customerId",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "totalAmount",
                        type: "numeric",
                        precision: 12,
                        scale: 2,
                        isNullable: false,
                    },
                    {
                        name: "status",
                        type: "sales.order_status_enum",
                        default: "'PENDING'",
                        isNullable: false,
                    },
                    {
                        name: "createdAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("sales.orders");
    }
}