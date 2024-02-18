import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AvatarBuilderService } from './avatar-builder.service';
import { GetCategoriesQueryDto } from './dtos/get-categories-query.dto';

@ApiTags('Avatar Builder')
@Controller('avatar-builder')
export class AvatarBuilderController {
  constructor(private avatarBuilderService: AvatarBuilderService) {}

  @Get('categories')
  async getCategories(@Query() query: GetCategoriesQueryDto) {
    const message = 'categories';
    const data = await this.avatarBuilderService.getCategories(query);
    return { message, data };
  }

  @Get('categories/:categoryId/items')
  async getCategoryItems(@Param('categoryId') id: string) {
    const message = 'items by category';
    const data = await this.avatarBuilderService.getCategoryItems(id);
    return { message, data };
  }

  @Get('default-male-avatar')
  async getDefaultMaleAvatar() {
    return await this.avatarBuilderService.getDefaultMaleAvatar();
  }

  @Get('default-female-avatar')
  async getDefaultFemale() {
    return await this.avatarBuilderService.getDefaultFemaleAvatar();
  }
}
