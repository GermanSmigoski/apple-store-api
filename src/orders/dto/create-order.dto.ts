import { Type } from 'class-transformer';
import {
  IsArray, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString,
  Min, ValidateNested, ArrayMinSize,
} from 'class-validator';

class AddressDto {
  @IsString() @IsNotEmpty() line1: string;
  @IsString() @IsOptional() line2?: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsString() @IsNotEmpty() zip: string;
  @IsString() @IsOptional() country?: string;
}

class CustomerDto {
  @IsString() @IsNotEmpty() name: string;
  @IsEmail() email: string;
  @ValidateNested() @Type(() => AddressDto) address: AddressDto;
}

class OrderItemDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsNumber() @Min(1) quantity: number;
}

export class CreateOrderDto {
  @ValidateNested() @Type(() => CustomerDto) customer: CustomerDto;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => OrderItemDto) items: OrderItemDto[];
}
