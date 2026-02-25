import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

class ProductDto {
  @IsString()
  product_id: string

  @IsNumber()
  @Min(1)
  quantity: number
}

export class CreateOrderDto {
  @IsString()
  orderId: string

  @IsString()
  customerId: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[]


}