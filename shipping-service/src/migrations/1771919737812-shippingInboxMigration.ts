import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ShippingInboxMigration1771919737812 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
  await queryRunner.createTable(
            new Table({
                name: "shipping_inbox",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "eventId",
                        type: "varchar",
                        isNullable: false,
                        isUnique: true,
                    },
                    {
                        name: "eventType",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "receivedAt",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {

        await queryRunner.dropTable("billing.billing_inbox");
    }
}