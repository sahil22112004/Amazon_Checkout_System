// import { Module } from '@nestjs/common';
// import { BillingService } from './billing.service';
// import { BillingController } from './billing.controller';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { BillingAccount } from '../entities/billing-account.entity';
// import { Payment } from '../entities/payment.entity';
// import { BillingInbox } from '../inbox/billing-inbox.entity';

// @Module({
//   imports: [
//     TypeOrmModule.forFeature([
//       BillingAccount,
//       Payment,
//       BillingInbox
//     ])
//   ],
//   controllers: [BillingController],
//   providers: [BillingService],
//   exports: [BillingService,BillingAccount,
//       Payment,]
  
// })
// export class BillingModule {}
