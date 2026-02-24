import { IsUUID, IsString } from 'class-validator';

export class PlaceBillingOrderDto {

  @IsString()
  orderId: string;

  @IsString()
  billingAccountId: string;

  @IsString()
  billingAddress: string;

}