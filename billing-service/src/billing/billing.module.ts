import { Module } from '@nestjs/common';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingOrder } from './entities/billingOrder.entity';

@Module({
  imports:[TypeOrmModule.forFeature([BillingOrder])],
  controllers: [BillingController],
  providers: [BillingService],
})
export class BillingModule {}
