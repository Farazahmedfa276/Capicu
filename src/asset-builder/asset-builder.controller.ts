import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AssetBuilderService } from './asset-builder.service';
import { GetCategoriesQueryDto } from './dtos/get-categories-query.dto';

@ApiTags('Asset Builder')
@Controller('asset-builder')
export class AssetBuilderController {
  constructor(private assetBuilderService: AssetBuilderService) {}

  @Get('categories')
  async getCategories(@Query() query: GetCategoriesQueryDto) {
    const message = 'categories';
    const data = await this.assetBuilderService.getCategories(query);
    return { message, data };
  }

  @Get('categories/:categoryId/items')
  async getItemsByCategories(@Param('categoryId') id: string) {
    try {
      const message = 'items by category';
      const data = await this.assetBuilderService.getCategoriesByItems(id);
      return { message, data };
    } catch (error) {

      throw new BadRequestException(error);
    }
  }

  @Get('items')
  async getListing(@Query() query) {
    try {
      const message = 'items by category';
      const data = await this.assetBuilderService.getListing(query);
      return { message, data };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('update-asset')
  async updateAsset() {
    try {
      const message = 'items by categoryy';
      const data = await this.assetBuilderService.updateAsset();
      return { message, data };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

}
