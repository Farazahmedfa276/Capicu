import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/json-web-token/jwt-auth-guard';
import { GetUserDto } from './dtos/get-user.dto';
import { SetAssetCategoriesDto, SetMintedCategoryDto } from './dtos/set-asset-categories.dto';
import { SetAvatarCategoriesDto } from './dtos/set-avatar-categories.dto';
import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GetUser } from './get-user.decorator';
import { UserDocument } from './user.schema';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('me')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getUserMe(@GetUser() user ) {
    return await this.userService.getUser(user.id);
  }

  @Get('getDomicoins')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getUserDomicoins(@GetUser() user ) {
    return await this.userService.getUserDomicoins(user.id);
  }

  @Get('get-user-by-params')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getUserByParams(
    @GetUser() user: UserDocument,
    @Query() query: GetUserDto,
  ) {
    try {
      return await this.userService.getUserByParams(query, user);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post('me')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @GetUser() userDoc: UserDocument,
    @Body() body: UpdateUserDto,
  ) {
    return await this.userService.updateUser(userDoc, body);
  }

  @Put('minted-inventory')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateMintedInventory(
    @GetUser() userDoc: UserDocument,
    @Body() body: SetMintedCategoryDto,
  ) {
    const message = 'Fetched successfuly';
    let character = body;
    console.log('body updateMintedInventory-->',body);
    // character = await this.userService.getAvatarDetails(character);
    await this.userService.updateUser(userDoc, {character});
    const data = body;
    return {message,data};
    
  }

  @Get('minted-inventory')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getMintedInventory(@GetUser() userDoc: UserDocument) {
    const message = 'Fetched successfuly';
    const data = userDoc.character;
    return {message,data};
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.getUser(id);
  }

  

  

  @Put('asset/categories')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async setAssetCategories(
    @GetUser() userDoc: UserDocument,
    @Body() body: SetAssetCategoriesDto,
  ) {
    const message = 'Saved successfuly';
    const data = await this.userService.setAssetCategories(userDoc, body);
    return { message, data };
  }

 

  @Patch('domicoins/update')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateDomicoins(
    @GetUser() userDoc: UserDocument,
    @Body('coins', new ParseIntPipe()) coins: number,
  ) {
    return await this.userService.updateDomicoins(userDoc, coins);
  }

  @Put('updateWhiteList')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updateWhiteList(@GetUser() userDoc: UserDocument) {
    return await this.userService.updateWhiteList(userDoc);
  }

  @Patch('update-password')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @GetUser() userDoc: UserDocument,
    @Body() body: UpdatePasswordDto,
  ) {
    return await this.userService.updatePassword(userDoc, body);
  }

  @Put('remove-address')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async removeWalletAddress(@GetUser() userDoc: UserDocument){
    return await this.userService.removeWalletAddress(userDoc);
  }

  

 

  

  
}
