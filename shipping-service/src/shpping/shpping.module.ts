import { Module } from '@nestjs/common';
import { ShppingService } from './shpping.service';
import { ShppingController } from './shpping.controller';
import { ShippingOrder } from './entities/shippingorder.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingOrder])],
  controllers: [ShppingController],
  providers: [ShppingService],
})
export class ShppingModule {}
