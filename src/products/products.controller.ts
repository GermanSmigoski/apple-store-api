import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(
    @Query('category') category?: string,
    @Query('featured') featured?: string,
  ) {
    const featuredBool = featured === 'true' ? true : featured === 'false' ? false : undefined;
    const data = await this.productsService.findAll(category, featuredBool);
    return { data, total: data.length };
  }

  @Get(':idOrSlug')
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const data = await this.productsService.findOne(idOrSlug);
    return { data };
  }
}
