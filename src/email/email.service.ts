import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { buildInvoiceHtml } from './templates/invoice.template';
import { OrderDocument } from '../orders/order.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private config: ConfigService) {
    this.resend = new Resend(this.config.get<string>('resendApiKey'));
    this.from = this.config.get<string>('emailFrom') ?? 'onboarding@resend.dev';
  }

  async sendInvoice(order: OrderDocument): Promise<void> {
    const html = buildInvoiceHtml({
      orderNumber: order.orderNumber,
      customerName: order.customer.name,
      items: order.items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        subtotal: i.subtotal,
      })),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      address: order.customer.address,
    });

    const { error } = await this.resend.emails.send({
      from: this.from,
      to: order.customer.email,
      subject: `Your Apple Store Order — ${order.orderNumber}`,
      html,
    });

    if (error) {
      this.logger.error(`Failed to send invoice for ${order.orderNumber}: ${error.message}`);
    } else {
      this.logger.log(`Invoice sent to ${order.customer.email} for order ${order.orderNumber}`);
    }
  }
}
