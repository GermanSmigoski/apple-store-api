import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

class Address {
  @Prop({ required: true }) line1: string;
  @Prop() line2?: string;
  @Prop({ required: true }) city: string;
  @Prop({ required: true }) state: string;
  @Prop({ required: true }) zip: string;
  @Prop({ default: 'US' }) country: string;
}

class Customer {
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) email: string;
  @Prop({ type: Address, required: true }) address: Address;
}

class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true }) productId: Types.ObjectId;
  @Prop({ required: true }) name: string;
  @Prop({ required: true }) price: number;
  @Prop({ required: true }) quantity: number;
  @Prop({ required: true }) subtotal: number;
  @Prop() image: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, unique: true })
  orderNumber: string;

  @Prop({ enum: ['pending', 'paid', 'shipped'], default: 'paid' })
  status: string;

  @Prop({ type: Customer, required: true })
  customer: Customer;

  @Prop({ type: [OrderItem], required: true })
  items: OrderItem[];

  @Prop({ required: true }) subtotal: number;
  @Prop({ required: true }) tax: number;
  @Prop({ required: true }) total: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
