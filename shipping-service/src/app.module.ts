import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShppingModule } from './shpping/shpping.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Products } from './shpping/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [Products],
      synchronize: false,
    }),ShppingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
