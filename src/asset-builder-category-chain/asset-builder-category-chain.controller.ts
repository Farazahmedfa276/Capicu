import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GeneralService } from 'src/general/general.service';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { AssetBuilderCategoryChainService } from './asset-builder-category-chain.service';

@ApiTags('Asset Builder Items')
@Controller('asset-builder-items')
export class AssetBuilderCategoryChainController {
  constructor(
    private assetBuilderCategoryChainService: AssetBuilderCategoryChainService,
    private generalService: GeneralService,
  ) {}

  @Get('items')
  async getItems(@Query() query) {
    try {
      const data = await this.assetBuilderCategoryChainService.getListing(
        query,
      );
      return this.generalService.paginate(data);
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  @Get('item/:id')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getItemById(@Param('id') id: string) {
    try {
      const message = 'Item Fetched Successfully';
      const data = await this.assetBuilderCategoryChainService.getItemById(id);
      return { message, data };
    } catch (error) {
      throw new BadRequestException('Item does not exist');
    }
  }
}
