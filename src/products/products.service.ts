import { Injectable, NotFoundException, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { PRODUCTS_SEED } from './seed/products.seed';

@Injectable()
export class ProductsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ProductsService.name);

  constructor(@InjectModel(Product.name) private productModel: Model<ProductDocument>) {}

  async onApplicationBootstrap() {
    const count = await this.productModel.countDocuments();
    if (count === 0) {
      await this.productModel.insertMany(PRODUCTS_SEED);
      this.logger.log(`Seeded ${PRODUCTS_SEED.length} products`);
    }
  }

  async findAll(category?: string, featured?: boolean): Promise<ProductDocument[]> {
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (featured !== undefined) filter.featured = featured;
    return this.productModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(idOrSlug: string): Promise<ProductDocument> {
    const isObjectId = /^[a-f\d]{24}$/i.test(idOrSlug);
    const product = isObjectId
      ? await this.productModel.findById(idOrSlug)
      : await this.productModel.findOne({ slug: idOrSlug });

    if (!product) throw new NotFoundException(`Product not found: ${idOrSlug}`);
    return product;
  }
}
