import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ShippingOrderMigrations1771938729650 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
         new Table({
           name: 'products',
           columns: [
             {
               name: 'product_id',
               type: 'uuid',
               isPrimary: true,
             },         
             {
               name: 'quantity_on_hand',
               type: 'decimal',
               isNullable: false,
             },
           ],
         }),
         true,
       );
     }
   
     public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.dropTable('products');
     }
   }