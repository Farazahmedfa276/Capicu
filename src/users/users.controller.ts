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
//import { GetUserDto } from './dtos/get-user.dto';
//import { SetAssetCategoriesDto, SetMintedCategoryDto } from './dtos/set-asset-categories.dto';
//import { SetAvatarCategoriesDto } from './dtos/set-avatar-categories.dto';
//import { UpdatePasswordDto } from './dtos/update-password.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ProductDto } from './dtos/buyProduct.dto';

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

  @Get('LeaderBoard')
  @ApiBearerAuth('accessToken')
  async LeaderBoard() {
    return await this.userService.LeaderBoards();
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

  @Post('buyProduct')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async buyProduct(
    @GetUser() userDoc: UserDocument,
    @Body() body: ProductDto,
  ) {
    return await this.userService.buyProduct(userDoc, body);
  }
  
  @Get('getProducts')
  @ApiBearerAuth('accessToken')
  @UseGuards(JwtAuthGuard)
  async getProducts( @GetUser() userDoc: UserDocument ) {
    console.log("----------",userDoc);
    return await this.userService.getProducts(userDoc._id);
  }
 

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return await this.userService.getUser(id);
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

  

  

  

  

 

  

  
}
