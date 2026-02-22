import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class BillingAccountsMigration1771784443914 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.createTable(
            new Table({
                name: "billing_accounts",
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
                        name: "balance",
                        type: "numeric",
                        isNullable: false,
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("billing.billing_accounts");
    }
}