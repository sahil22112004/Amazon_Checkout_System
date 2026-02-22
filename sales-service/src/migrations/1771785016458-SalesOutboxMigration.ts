import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class SalesOutboxMigration1771785016458 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
     await queryRunner.query(`
            CREATE TYPE sales.outbox_status_enum AS ENUM ('PENDING', 'PUBLISHED')
        `);

        await queryRunner.createTable(
            new Table({
                name: "sales_outbox",
                columns: [
                    {
                        name: "id",
                        type: "uuid",
                        isPrimary: true,
                        generationStrategy: "uuid",
                        default: "uuid_generate_v4()",
                    },
                    {
                        name: "eventType",
                        type: "varchar",
                        isNullable: false,
                    },
                    {
                        name: "payload",
                        type: "jsonb",
                        isNullable: false,
                    },
                    {
                        name: "status",
                        type: "sales.outbox_status_enum",
                        default: "'PENDING'",
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
        await queryRunner.dropTable("sales.sales_outbox");
        await queryRunner.query(`DROP TYPE sales.outbox_status_enum`);
    }
}