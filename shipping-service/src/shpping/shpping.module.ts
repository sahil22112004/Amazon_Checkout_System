import { Module } from '@nestjs/common';
import { ShppingService } from './shpping.service';
import { ShppingController } from './shpping.controller';

@Module({
  controllers: [ShppingController],
  providers: [ShppingService],
})
export class ShppingModule {}
