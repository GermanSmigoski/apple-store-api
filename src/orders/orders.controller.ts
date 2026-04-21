import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() dto: CreateOrderDto) {
    const data = await this.ordersService.create(dto);
    return {
      data: {
        _id: data._id,
        orderNumber: data.orderNumber,
        total: data.total,
        status: data.status,
      },
    };
  }
}
