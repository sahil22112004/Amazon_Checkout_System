import { IsUUID, IsString } from 'class-validator';

export class CreateShippingDto {

  @IsString()
  orderId: string;

  @IsString()
  shippingAddress: string;

}