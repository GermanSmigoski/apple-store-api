import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  tagline: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  price: number; // in cents

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ required: true, enum: ['mac', 'iphone', 'ipad', 'airpods', 'watch', 'accessories'] })
  category: string;

  @Prop({ default: false })
  featured: boolean;

  @Prop({ type: Object, default: {} })
  specs: Record<string, string>;

  @Prop({ default: 50 })
  stock: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
