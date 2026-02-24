import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class ProductMigration1771935296931 implements MigrationInterface {

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
               name: 'price',
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