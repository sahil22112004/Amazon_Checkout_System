import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class BillOrderMigration1771937555291 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
                new Table({
                    name: "billingOrder",
                    columns: [
                        {
                            name: "order_id",
                            type: "uuid",
                            isPrimary: true,
                            generationStrategy: "uuid",
                            default: "uuid_generate_v4()",
                        },
                        {
                            name: "billing_account_id",
                            type: "varchar",
                            isNullable: false,
                        },
                        {
                            name: "billing_address",
                            type: "varchar",
                            isNullable: false,
                        },
                    ],
                }),
                true
            );
        }
    
        public async down(queryRunner: QueryRunner): Promise<void> {
            await queryRunner.dropTable("billing.payments");
        }
    }