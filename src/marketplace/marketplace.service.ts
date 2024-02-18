import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, mongo } from 'mongoose';
import { GameCenterService } from 'src/game-center/game-center.service';
import { GameService } from 'src/game/game.service';
import { GeneralService } from 'src/general/general.service';
import { TournamentsService } from 'src/tournaments/tournaments.service';
import { User, UserDocument } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';
import { InventoryType } from './constants/inventory-type.enum';
import { MarketplaceStatus } from './constants/marketplace-status.enum';
import { OfferStatus } from './constants/offer-status.enum';
import { RentType } from './constants/rent-type.enum';
import { SellingType } from './constants/selling-type.enum';
import { MarketPlace, MarketPlaceDocument } from './marketplace.schema';
import { Offer, OfferDocument } from './offers.schema';
import { SendOfferDto } from './dto/send-offer.dto';

@Injectable()
export class MarketPlaceService {
  constructor(
    @InjectModel(MarketPlace.name)
    private marketPlaceModel: Model<MarketPlaceDocument>,
    @InjectModel(Offer.name)
    private offerModel: Model<OfferDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private gameCenterService: GameCenterService,
    private generalService: GeneralService,
    private userService: UsersService,
    private gameService: GameService,
    private tournamentService: TournamentsService,
  ) { }

  async nftDetail(id, user) {
    // let marketPlace = await this.marketPlaceModel.findOne({'tokenId':id});
    let nftDetails = await this.marketPlaceModel.findOne({ _id: id });

    if (!nftDetails) {
      throw new NotFoundException('No MarketPlace Inventory Found');
    }

    let ownerUser = await this.userModel.findOne({
      metaMaskWalletAddress: nftDetails.userWalletAddress,
    });

    if (nftDetails.rentData) {
      let tenantUser = await this.userModel.findOne({
        metaMaskWalletAddress: {
          $exists: true,
          $eq: nftDetails.toWalletAddress,
        },
      });

      console.log('tenantUser-->', tenantUser);

      nftDetails.tenantName = tenantUser
        ? tenantUser.firstName + ' ' + tenantUser.lastName
        : '';
    }
    nftDetails.ownerName = ownerUser
      ? ownerUser.firstName + ' ' + ownerUser.lastName
      : '';

    let offer = await this.offerModel.findOne({ marketPlaceId: id });

    const offerGiven = await this.offerModel.findOne({
      marketPlaceId: nftDetails.id,
      fromUserId: user.id,
    });

    const nftStats = await this.nftStats(nftDetails.tokenId);

    return {
      nftDetails,
      offer,
      offerGiven,
      nftStats: {
        gamesPlayed: nftStats.nftStats.gamesPlayed,
        tournamentsPlayed: nftStats.nftStats.tournamentsPlayed,
      },
    };
  }

  async getRentedPercentage(userId, tokenId) {
    let currentDate = new Date().getTime();

    let inventory = await this.marketPlaceModel.findOne({
      userId: userId,
      type: SellingType.RENT,
      'rentData.rentType': { $ne: RentType.FIXED },
      tokenId: tokenId,
      isSold: true,
      expiryTime: { $lt: currentDate },
    });

    return inventory;
  }

  async nftStats(tokenId) {
    let gamesPlayed = await this.gameService.getGamesPlayedOfNft(
      tokenId.toString(),
    );
    let tournamentsPlayed =
      await this.tournamentService.getTournamentsPlayedByNft(
        tokenId.toString(),
      );
    return { nftStats: { gamesPlayed, tournamentsPlayed } };
  }

  async sell(body, user) {
    // console.log(body,"========BODY======")
    if (!body.network && body.inventoryType !== InventoryType.GAMECENTER) {
      throw new ForbiddenException("chain id is not defined")
    }
    else {
      let inventory = await this.marketPlaceModel.findOne({
        tokenId: body.tokenId,
        isSold: false,
      });

      if (inventory) {
        throw new BadRequestException(
          'Inventory already exists with this token id',
        );
      }

      if (body.inventoryType == InventoryType.GAMECENTER) {
        let game_center = await this.gameCenterService.getById({
          _id: body.gameCenterId,
          ownerId: user._id,
        });
        game_center.placeOnMarketPlace = true;
        await game_center.save();
        body.status = MarketplaceStatus.ACTIVE;
      }

      body.userId = user.id;
      body.userWalletAddress = user.metaMaskWalletAddress;
      let marketPlace = await this.marketPlaceModel.create(body);
      console.log(marketPlace)
      if (
        marketPlace.rentData &&
        marketPlace.rentData.rentType == RentType.USEROFFER
      ) {
        this.createUserOffer({
          marketPlace,
          user,
          status: OfferStatus.USER_ACCEPTANCE,
          fromAddress: user.metaMaskWalletAddress,
          toAddress: marketPlace.rentData.walletAddress,
        });
      }

      return { message: 'Inventory Placed on sale' };
    }
  }

  async verifyTransaction(data) {
    let marketplace = await this.marketPlaceModel.findOne({
      hash: data.hash,
      status: MarketplaceStatus.PENDING,
    });
    console.log("ok", marketplace)
    if (!marketplace) {
      throw new NotFoundException('MarketPlace not found');
    }
    data.network = marketplace.network;

    let result = await this.generalService.verifyTransaction(
      data,
      'marketplace',
    );

    marketplace.status = result
      ? MarketplaceStatus.ACTIVE
      : MarketplaceStatus.CANCELLED;
    await marketplace.save();
  }

  addDays(date, days) {
    console.log('date-->', date);
    var result = new Date(date);
    console.log('result-->', result);

    result.setDate(result.getDate() + days);
    console.log('result after-->', result);
    return result.getTime();
  }

  async buy(id, user) {
    let marketPlace = await this.marketPlaceModel.findOne({
      _id: id,
      isSold: false,
    });
    console.log(marketPlace, "MarketPlace")
    if (!marketPlace) {
      throw new BadRequestException('No MarketPlace Found');
    }

    if (marketPlace.type == SellingType.RENT) {
      marketPlace.expiryTime = this.addDays(
        new Date(),
        +marketPlace.rentData.numberOfDays,
      );
      this.changeRentStatus(marketPlace);
    }

    marketPlace.isSold = true;
    marketPlace.toWalletAddress = user.metaMaskWalletAddress;
    await marketPlace.save();

    return { message: 'Inventory Sold Successfully' };
  }

  async changeRentStatus(marketPlace) {
    switch (marketPlace.rentData.rentType) {
      case RentType.USEROFFER: {
        await this.offerModel.updateOne(
          { marketPlaceId: marketPlace._id },
          { $set: { status: OfferStatus.ACCEPTED } },
        );
      }
      case RentType.NEGOTIABLE: {
        await this.offerModel.updateMany(
          { marketPlaceId: marketPlace._id },
          { $set: { status: OfferStatus.REJECTED } },
        );
      }
    }
  }

  async offer(id, user) {
    let offer = await this.offerModel.findOne({ _id: id });

    if (!offer) {
      throw new BadRequestException('There is no offer');
    }

    let marketPlace = await this.marketPlaceModel.findOne({
      _id: offer.marketPlaceId,
      isSold: false,
      'rentData.rentType': { $in: [RentType.NEGOTIABLE, RentType.USEROFFER] },
    });

    if (!marketPlace) {
      throw new NotFoundException('MarketPlace not found');
    }

    let user_acceptance_offer = await this.offerModel.findOne({
      marketPlaceId: marketPlace._id,
      status: OfferStatus.USER_ACCEPTANCE,
    });

    if (user_acceptance_offer) {
      throw new BadRequestException('Offer Already exists on this marketplace');
    }

    let offer_obj = {
      rentType: marketPlace.rentData!.rentType,
      marketPlaceId: marketPlace._id,
      marketPlace: marketPlace,
      fromUser: user.metaMaskWalletAddress,
      price: offer.price,
      toUser: offer.fromUser,
      status: OfferStatus.USER_ACCEPTANCE,
    };

    marketPlace.status = MarketplaceStatus.USER_ACCEPTANCE;
    marketPlace.rentData.rentType = RentType.USEROFFER;
    marketPlace.rentData.rentEarning = '' + offer.quote;
    marketPlace.rentData.walletAddress = offer.fromUser;
    await this.marketPlaceModel.updateOne(
      { _id: marketPlace._id },
      { $set: marketPlace },
    );

    await this.offerModel.create(offer_obj);

    return { message: 'Offer Sent to user' };
  }

  async createUserOffer(data) {
    console.log(data, '===> DATA')
    let offer_obj = {
      rentType: data.marketPlace.rentData!.rentType,
      marketPlaceId: data.marketPlace._id,
      marketPlace: data.marketPlace,
      fromUser: data.fromAddress,
      quote:
        data.marketPlace.rentData!.rentType == RentType.NEGOTIABLE
          ? data.price
          : data.marketPlace.price,
      toUser: data.toAddress,
      status: data.status,
    };
    await this.offerModel.create(offer_obj);
  }

  async exclusiveOffers(user, query) {
    if (!query.network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      let mongo_query = {
        status: OfferStatus.USER_ACCEPTANCE,
        toUser: user.metaMaskWalletAddress,
        'marketPlace.network': query.network,
      };

      if (query.inventoryClass && query.inventoryClass != '') {
        let classes = query.inventoryClass.split(',');
        classes.forEach((element) => {
          if(element === "1"){
            classes.push(
              `asset_class_${element}`,
              `avatar-male-class-${element}`,
              `avatar-female-class-${element}`,
              `avatar-male-class-a`,
              `avatar-female-class-a`,
            );
          }
          else{
            classes.push(
              `asset_class_${element}`,
              `avatar-male-class-${element}`,
              `avatar-female-class-${element}`,
            );
          }
          
        });
        mongo_query['marketPlace.inventoryClass'] = { $in: classes };
      }

      if (query.minPrice && query.minPrice != '') {
        mongo_query['marketPlace.price'] = { $gte: +query.minPrice };
      }

      if (query.maxPrice && query.maxPrice != '') {
        mongo_query['marketPlace.price'] = { ...mongo_query['marketPlace.price'], $lte: +query.maxPrice };
      }

      const current_page = query.page ? +query.page : 1;

      const limit = query.limit ? +query.limit : 10;

      const offset = limit * current_page - limit;

      let total_count = await this.offerModel.count(mongo_query);

      let data = await this.offerModel
        .find(mongo_query)
        .skip(offset)
        .limit(limit);

      return { data, total_count, current_page, limit };
    }
  }

  async myInventory(params, user) {
    if (!params.network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      let tokens = params.tokenIds.split(',');
      let network = params.network;

      let tokenIds = await this.removeRentedTokenIds(tokens, user, network);
      console.log("fdf", tokenIds)

      return tokenIds;
    }
  }

  async myInventoryWithRentedCards(params, user) {
    if (!params.network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      let network = params.network;
      let tokens = params.tokenIds ? params.tokenIds.split(',') : [];
      let tokenIds = await this.removeRentedTokenIds(tokens, user, network);
      console.log("remove o not",tokenIds);
      await this.getUserRentedTokenIds(tokenIds, user, network);

      return tokenIds;
    }
  }
  
  async replaceurl(url: string) {
    const marketplace = await this.marketPlaceModel.find();
    const offers = await this.offerModel.find();

    marketplace.forEach((element) => {
      element.uri = element.uri.replace(/^.*[\\\/]/, `${url}/`);
      element.save();
    });

    offers.forEach((element) => {
      const json = element.toJSON()
      const marketPlace = json.marketPlace
      marketPlace.uri = marketPlace.uri.replace(
        /^.*[\\\/]/,
        `${url}/`,
      );
      element.marketPlace = marketPlace
      element.save();
    });
  }

  async getUserRentedTokenIds(tokenIds, user, network) {
    if (!network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      let currentDate = new Date().getTime();
      let inventories = await this.marketPlaceModel.find(
        {
          toWalletAddress: user.metaMaskWalletAddress,
          isSold: true,
          type: 'rent',
          expiryTime: { $gt: currentDate },
          network: network
        },
        { tokenId: 1 },
      );

      inventories.forEach((inventory) => {
        tokenIds.push(inventory.tokenId.toString());
      });
    }
  }

  async removeRentedTokenIds(tokenIds, user, network) {
    if (!network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      let currentDate = new Date().getTime();

      let inventories = await this.marketPlaceModel.find(
        {
          userId: user.id,
          tokenId: { $in: tokenIds },
          status: { $ne: MarketplaceStatus.CANCELLED },
          network: network
        },
        { tokenId: 1, expiryTime: 1 , isSold: 1},
      );

      if (inventories.length) {
        console.log(inventories, "-=-=-=")
        let inventoryIds = inventories.map((inventory) => {
          if (inventory?.expiryTime) {
            if (inventory.expiryTime > currentDate) {
              return '' + inventory.tokenId;
            }
          }
          else {
            if(!inventory?.isSold){
              return '' + inventory.tokenId;
            }
          }

        });

        let idsToRemove = new Set(inventoryIds);

        tokenIds = tokenIds.filter((i) => {
          return !idsToRemove.has(i);
        });
      }

      return tokenIds;
    }
  }

  makeListingQuery(query, user) {
    if (!query.network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      console.log(user, "######USER#######")
      if (!user.metaMaskWalletAddress) {
        return []
      }
      else {
        let mongo_query = {
          isSold: false,
          status: {
            $in: [MarketplaceStatus.ACTIVE, MarketplaceStatus.USER_ACCEPTANCE],
          },
          userWalletAddress: { $ne: user.metaMaskWalletAddress },
          'rentData.rentType': { $ne: RentType.USEROFFER },
        };

       
        if (query.type && query.type != '') {
          mongo_query['type'] = query.type;
        }

        if (query.inventoryClass && query.inventoryClass != '') {
          let classes = query.inventoryClass.split(',');
          classes.forEach((element) => {
            if(element === "1"){
              classes.push(
                `asset_class_${element}`,
                `avatar-male-class-${element}`,
                `avatar-female-class-${element}`,
                `avatar-male-class-a`,
                `avatar-female-class-a`,
              );
            }
            else{
              classes.push(
                `asset_class_${element}`,
                `avatar-male-class-${element}`,
                `avatar-female-class-${element}`,
              );
            }
          });
          mongo_query['inventoryClass'] = { $in: classes };
        }

        if (query.minPrice && query.minPrice != '') {
          mongo_query['price'] = { $gte: +query.minPrice };
        }

        if (query.maxPrice && query.maxPrice != '') {
          mongo_query['price'] = { ...mongo_query['price'], $lte: +query.maxPrice };
        }

        if (query.inventoryType && query.inventoryType != '') {
          mongo_query['inventoryType'] = query.inventoryType;
        }

        if (query.inventoryType !== InventoryType.GAMECENTER) {
          mongo_query['network'] = query.network;
        }


        if (query.myInventory && query.myInventory == 'true') {
          mongo_query['userWalletAddress'] = user.metaMaskWalletAddress;
          delete mongo_query['rentData.rentType'];
        }

        return mongo_query;
      }
    }
  }

  async walletUsers(user) {
    return this.userService.getUsersWithWallet(user);
  }

  async searchQuery(query, user) {
    
    
      let mongo_query = {
        isSold: false,
        status: MarketplaceStatus.ACTIVE,
        userWalletAddress: { $ne: user.metaMaskWalletAddress },
        'rentData.rentType': { $ne: RentType.USEROFFER },
      };

      query.isSearch = '';

      const isEmpty = Object.values(query).every((x) => x === null || x === '');



      if (isEmpty) {
        mongo_query['price'] = { $lt: 0 };
        return mongo_query;
      }

      if (!query.network && query.network === '') {
        return mongo_query;
      }

      if (query.search) {
        mongo_query['inventoryName'] = { $regex: query.search, $options: 'i' };
      }

      if (query.minPrice && query.minPrice != '') {
        mongo_query['price'] = { $gte: +query.minPrice };
      }

      if (query.maxPrice && query.maxPrice != '') {
        mongo_query['price'] = { ...mongo_query['price'], $lte: +query.maxPrice };
      }

      if (query.inventoryClass && query.inventoryClass != '') {
        let classes = query.inventoryClass.split(',');
        classes.forEach((element) => {
          if(element === "1"){
            classes.push(
              `asset_class_${element}`,
              `avatar-male-class-${element}`,
              `avatar-female-class-${element}`,
              `avatar-male-class-a`,
              `avatar-female-class-a`,
            );
          }
          else{
            classes.push(
              `asset_class_${element}`,
              `avatar-male-class-${element}`,
              `avatar-female-class-${element}`,
            );
          }
        });
        mongo_query['inventoryClass'] = { $in: classes };
      }
      if(query.search || query.minPrice || query.maxPrice || query.inventoryClass){
        mongo_query['network'] = query.network;
      }
      console.log('mongo_query in sale-->', mongo_query);
      return mongo_query;
    
  }

  async recoverInventory(id) {
    let inventory = await this.marketPlaceModel.findOne({ _id: id });

    if (!inventory) {
      throw new NotFoundException('No Inventory Found');
    }

    inventory.delete();
  }

  async getInventoryOnSale(user, query) {
    const mongo_query = query.isSearch
      ? await this.searchQuery(query, user)
      : this.makeListingQuery(query, user);

    const current_page = query.page ? +query.page : 1;

    const limit = query.limit ? +query.limit : 50;

    const offset = limit * current_page - limit;

    let total_count = await this.marketPlaceModel.count(mongo_query);

    // let inventory;
    // if(inventory == InventoryType.GAMECENTER){
    //   await this.marketPlaceModel.find(mongo_query)
    // }
    // else{}
    let inventory = await this.marketPlaceModel
      .find(mongo_query)
      .skip(offset)
      .limit(limit)
      .sort({ _id: -1 });

    const inventory_arr = [];

    for (let i = 0; i < inventory.length; i++) {
      let item = inventory[i];

      try {
        if (item.inventoryType == InventoryType.GAMECENTER) {
          item.gameCenter = await this.gameCenterService.getById({
            _id: item.gameCenterId,
            status: true,
          });
          if(query.network === process.env.POLYGON_CHAINID && item.gameCenter.owner.is_admin){
            item.gameCenter.owner.metaMaskWalletAddress = process.env.POLYGON_CONTRACT_ADDRESS
          }
        }

        item.isOwner = item.userWalletAddress == user.metaMaskWalletAddress;

        const ownerUser = await this.userModel.findOne({
          metaMaskWalletAddress: item.userWalletAddress,
        });
        item.ownerName = ownerUser
          ? ownerUser.firstName + ' ' + ownerUser.lastName
          : '';
          if(item.inventoryType == InventoryType.GAMECENTER && !item.gameCenter.owner.is_admin){
            if(item.network === query.network ){
              inventory_arr.push(item);
            }
          }
          else{
            inventory_arr.push(item);
          }
      } catch (error) {
        console.log('getInventoryOnSale', error);
        continue;
      }
    }

    return { data: inventory_arr, total_count, current_page, limit };
  }

  async removeFromMarket(id, user) {
    let inventory = await this.marketPlaceModel.findOne({
      _id: id,
      isSold: false,
      userId: user.id,
    });

    if (!inventory) {
      throw new NotFoundException('No Inventory Found');
    }

    if (inventory.inventoryType == InventoryType.GAMECENTER) {
      let gameCenter = await this.gameCenterService.getById({
        _id: inventory.gameCenterId,
      });
      gameCenter.placeOnMarketPlace = false;
      await gameCenter.save();
    }

    if(inventory?.rentData?.rentType == RentType.USEROFFER){
      await this.offerModel.updateMany(
        { marketPlaceId: id },
        { $set: { status: OfferStatus.REJECTED } },
      );
    }

    inventory.delete();

    

    return { message: 'Inventory removed from marketplace' };
  }

  async rejectOffer(id) {
    let offer = await this.offerModel.findOne({ _id: id });

    if (!offer) {
      throw new NotFoundException('Offer Not Found');
    }

    offer.status = OfferStatus.REJECTED;
    await offer.save();

    if (offer.marketPlace.rentData.rentType == RentType.USEROFFER) {
      await this.marketPlaceModel.updateOne(
        { _id: offer.marketPlaceId },
        { $set: { status: MarketplaceStatus.CANCELLED } },
      );
    }
    return { message: 'Offer Rejected' };
  }

  async sendOffer(user: UserDocument, id: string, data: SendOfferDto) {
    
    
      let marketPlace = await this.marketPlaceModel.findOne({ _id: id });
      if (!marketPlace) {
        throw new NotFoundException('Marketplace not found');
      }

      let offer_count = await this.offerModel.count({
        marketPlaceId: id,
        fromUser: user.metaMaskWalletAddress,
        status: { $ne: OfferStatus.REJECTED },
      });

      if (offer_count) {
        // throw new BadRequestException("You have already given offer");
        await this.offerModel.updateOne(
          {
            marketPlaceId: id,
            fromUser: user.metaMaskWalletAddress,
            status: { $ne: OfferStatus.REJECTED },
          },
          { $set: { quote: data.quote } },
        );
        return { message: 'Offer Updated Successfully' };
      }

      this.createUserOffer({
        marketPlace,
        fromAddress: user.metaMaskWalletAddress,
        toAddress: marketPlace.userWalletAddress,
        status: OfferStatus.SENT_BY_USER,
        price: data.quote,
        
      });

      return { message: 'Offer Sent Successfully' };
    
  }

  async offersOnInventory(id, query) {
    if (!query.network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      let mongo_query = {
        marketPlaceId: id,
        status: { $ne: OfferStatus.REJECTED },
        rentType: RentType.NEGOTIABLE,
        'marketPlace.network': query.network,
      };

      const current_page = query.page ? +query.page : 1;

      const limit = query.limit ? +query.limit : 10;

      const offset = limit * current_page - limit;

      let total_count = await this.offerModel.count(mongo_query);

      let offers = await this.offerModel
        .find(mongo_query)
        .skip(offset)
        .limit(limit);

      let offers_data = offers.map(async (offer) => {
        let user = await this.userModel.findOne({
          metaMaskWalletAddress: offer.fromUser,
        });

        offer.user = user;

        return offer;
      });

      let data = await Promise.all(offers_data);

      return { data, total_count, current_page, limit };
    }
  }

  // inventories taken on rent from other user
  async rentedInventories(user, query) {
    if (!query.network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      let currentDate = new Date().getTime();
      if (!user.metaMaskWalletAddress) {
        return [];
      }
      else {
        let mongo_query = {
          isSold: true,
          toWalletAddress: user.metaMaskWalletAddress,
          type: 'rent',
          expiryTime: { $gt: currentDate },
          network: query.network,
        };



        if (query.inventoryType && query.inventoryType != '') {
          mongo_query['inventoryType'] = query.inventoryType;
        }

        this.makeQuery(query, mongo_query);

        const current_page = query.page ? +query.page : 1;

        const limit = query.limit ? +query.limit : 10;

        const offset = limit * current_page - limit;

        let total_count = await this.marketPlaceModel.count(mongo_query);

        let inventories = await this.marketPlaceModel
          .find(mongo_query)
          .skip(offset)
          .limit(limit);

        let inventory_array = inventories.map(async (inventory) => {
          let ownerUser = await this.userModel.findOne({
            metaMaskWalletAddress: inventory.userWalletAddress,
          });

          inventory.ownerName = ownerUser
            ? ownerUser.firstName + ' ' + ownerUser.lastName
            : '';

          return inventory;
        });

        let data = await Promise.all(inventory_array);

        return { data, total_count, current_page, limit };
      }
    }
  }

  makeQuery(query, mongo_query) {
    if (query.minPrice && query.minPrice != '') {
      mongo_query['price'] = { $gte: +query.minPrice };
    }

    if (query.maxPrice && query.maxPrice != '') {
      mongo_query['price'] = { ...mongo_query['price'], $lte: +query.maxPrice };
    }

    if (query.inventoryClass && query.inventoryClass != '') {
      let classes = query.inventoryClass.split(',');
      classes.forEach((element) => {
        if(element === "1"){
          classes.push(
            `asset_class_${element}`,
            `avatar-male-class-${element}`,
            `avatar-female-class-${element}`,
            `avatar-male-class-a`,
            `avatar-female-class-a`,
          );
        }
        else{
          classes.push(
            `asset_class_${element}`,
            `avatar-male-class-${element}`,
            `avatar-female-class-${element}`,
          );
        }
      });
      mongo_query['inventoryClass'] = { $in: classes };
    }

    console.log('mongo_query in function-->', mongo_query);
  }

  //inventories given on rent to other user
  async myRentedInventories(user, query) {
    if (!query.network) {
      throw new BadRequestException("chain id is not defined")
    }
    else {
      let currentDate = new Date().getTime();
      // console.log("currentDateinunixtimestam", currentDate);
      console.log(user.metaMaskWalletAddress, "*******user.metaMaskWalletAddress********")
      if (!user.metaMaskWalletAddress) {
        return []
      }
      else {
        let mongo_query = {
          isSold: true,
          userWalletAddress: user.metaMaskWalletAddress,
          type: 'rent',
          expiryTime: { $gt: currentDate },
          network: query.network,
        };

        if (query.inventoryType && query.inventoryType != '') {
          mongo_query['inventoryType'] = query.inventoryType;
        }

        this.makeQuery(query, mongo_query);

        console.log('mongo_query in parent function-->', mongo_query);

        const current_page = query.page ? +query.page : 1;

        const limit = query.limit ? +query.limit : 10;

        const offset = limit * current_page - limit;

        let total_count = await this.marketPlaceModel.count(mongo_query);

        let data = await this.marketPlaceModel
          .find(mongo_query)
          .skip(offset)
          .limit(limit);

        return { data, total_count, current_page, limit };
      }
    }
  }
}
