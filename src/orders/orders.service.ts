import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { customAlphabet } from 'nanoid';
import { Order, OrderDocument } from './order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { ProductsService } from '../products/products.service';
import { EmailService } from '../email/email.service';

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    private productsService: ProductsService,
    private emailService: EmailService,
  ) {}

  async create(dto: CreateOrderDto): Promise<OrderDocument> {
    const resolvedItems = await Promise.all(
      dto.items.map(async ({ productId, quantity }) => {
        const product = await this.productsService.findOne(productId);
        if (product.stock < quantity) {
          throw new BadRequestException(`Insufficient stock for ${product.name}`);
        }
        return {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity,
          subtotal: product.price * quantity,
          image: product.images?.[0] ?? '',
        };
      }),
    );

    const subtotal = resolvedItems.reduce((acc, i) => acc + i.subtotal, 0);
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    const order = await this.orderModel.create({
      orderNumber: `ORD-${nanoid()}`,
      status: 'paid',
      customer: dto.customer,
      items: resolvedItems,
      subtotal,
      tax,
      total,
    });

    // Fire-and-forget — don't block response on email delivery
    this.emailService.sendInvoice(order).catch((err) =>
      this.logger.error(`Invoice email failed: ${err}`),
    );

    return order;
  }
}
