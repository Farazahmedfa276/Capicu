import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import { ethers } from 'ethers';
import { Model } from 'mongoose';
import { FetchService } from 'nestjs-fetch';
import { Coin, CoinDocument } from './coin.schema';
import { Contact, ContactDocument } from './contact.schema';
import { ContactUsDto } from './dto/contact-us.dto';
import { GameRule, GameRuleDocument } from './gamerule.schema';
import { Promotion, PromotionDocument } from './promotion.schema';
import { Setting, SettingDocument } from './setting.schema';
import fetch from 'cross-fetch';
import { AssetPercentage, AssetPercentageDocument } from './asset-percentages.schema';
import { Season, SeasonDocument } from './season.schema';
import { SeasonType } from './constants/season.enum';
import { User, UserDocument } from 'src/users/user.schema';
import { Quarter , QuarterDocument } from 'src/game/quarter.schema';
import { MarketPlace, MarketPlaceDocument } from 'src/marketplace/marketplace.schema';
import { AssetPrice, AssetPriceDocument } from 'src/asset-builder/asset-price.schema';
import { CoinExchange, CoinExchangeDocument } from './coinexhanges.schema';
import { ObjectId } from 'mongodb';
import { AvatarBuilderService } from 'src/avatar-builder/avatar-builder.service';
import { AssetBuilderService } from 'src/asset-builder/asset-builder.service';
import { AvatarBuilderCategory, AvatarBuilderCategoryDocument } from 'src/avatar-builder/avatar-builder-category.schema';

@Injectable()
export class GeneralService {
  constructor(
    @InjectModel(Promotion.name)
    private promotionModel: Model<PromotionDocument>,

    @InjectModel(Contact.name)
    private contactModel: Model<ContactDocument>,
    @InjectModel(Coin.name) private coinModel: Model<CoinDocument>,
    @InjectModel(AssetPrice.name)
    private assetPriceModel: Model<AssetPriceDocument>,
    private mailerService: MailerService,
    @InjectModel(GameRule.name)
    private gameRuleModel: Model<GameRuleDocument>,
    private configService: ConfigService,
    @InjectModel(Setting.name)
    private settingsModel: Model<SettingDocument>,
    @InjectModel(AssetPercentage.name)
    private assetPercentageModel: Model<AssetPercentageDocument>,
    @InjectModel(Season.name)
    private seasonModel: Model<SeasonDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    @InjectModel(CoinExchange.name)
    private coinExchangeModel: Model<CoinExchangeDocument>,
    @InjectModel(MarketPlace.name)
    private marketPlaceModel: Model<MarketPlaceDocument>,
    @InjectModel(Quarter.name)
    private quarterModal: Model<QuarterDocument>,
    @InjectModel(AvatarBuilderCategory.name)
    private avatarBuilderCategoryModel: Model<AvatarBuilderCategoryDocument>,
    private assetBuilderService: AssetBuilderService,
  ) {}

  async getLaunchDate(query) {
    return await this.promotionModel.findOne(query);
  }

  async season() {
    let season = await this.seasonModel.findOne();

    // console.log('season-->',season);

    let curr_Date = new Date();
    console.log(curr_Date, '===> currDate');
    // let new_curr_date = curr_Date.getDate()
    // let new_curr_month = curr_Date.getMonth()
    // let new_curr_year  =curr_Date.getFullYear()
    // var fullNewDate = new_curr_date +'-'+ new_curr_month +'-'+ new_curr_year

    // console.log(fullNewDate,'DATE ===>')

    if (season && season.type == SeasonType.MANUAL) {
      season.selectedSeason = season.season[0];
      return season.selectedSeason;
    }

    // console.log('season after-->',season.season);
    let data = season.season;
    // console.log(data,"DATA")
    for (var [k, v] of Object.entries(data)) {
      if (v.from > curr_Date && v.to < curr_Date) {
      }
      return {
        name: v.name.toLowerCase(),
        slug: v.slug,
        from: v.from,
        to: v.to,
      };
    }
  }

  async storeCoinExchange(data, user) {
    if (user.domicoins < data.coin) {
      throw new BadRequestException('Not Enough Coins');
    }
    data.userId = user._id;
    data.walletAddress = user.metaMaskWalletAddress;
    data.name = user.firstName;
    data.usdt = await this.convertDomicoinsToUsdt(data.coin);
    console.log('exchange', data);

    await this.coinExchangeModel.create(data);

    if (!data.type) {
      user.domicoins -= data.coin;
      await user.save();
    }
    return { message: 'Coin Exchange Saved' };
  }

  async getGameRules() {
    return this.gameRuleModel.find().sort({ tabindex: 1 });
  }

  async checkWhiteListDate(user, query) {
    if (query.network === process.env.BNB_CHAINID) {
      const promotion = await this.promotionModel.findOne({
        promotion_status: 1,
      });
      console.log(promotion, 'bnb');
      return {
        data: !!promotion && user.whiteListed,
        discount: promotion ? promotion.discount : 0,
      };
    }
    if (query.network === process.env.POLYGON_CHAINID) {
      const promotion = await this.promotionModel.findOne({
        promotion_polygon_status: 1,
      });
      console.log(promotion, 'polygon');
      return {
        data: !!promotion && user.polygonWhiteListed,
        discount: promotion ? promotion.polygon_discount : 0,
      };
    }
    return { data: false };
  }

  async newsLetter(data) {
    let html = "";

    let message = 'Success';

    let news_letter_data = await this.contactModel.findOne({
      email: data.email,
    });

    if (!news_letter_data) {
      data.news_letter = true;
      await this.contactModel.create(data);

      if (!data?.email) {
        return;
      }

      await this.mailerService.sendMail({
        to: data.email,
        subject: 'Capicu -- NewsLetter Subscription',
        html: html,
      });
    } else {
      if (news_letter_data.news_letter) {
        message = 'You have already subscribed to newsletter';
        throw new BadRequestException(message);
      }

      await this.contactModel.updateOne(data, { $set: { news_letter: true } });
    }

    return { message };
  }

  async getCoinRate() {
    return await this.coinModel.findOne({});
  }

  async contactUs(data: ContactUsDto) {
    const message = 'Success';
    let html = "";

    await this.contactModel.create(data);

    console.log('email', {
      to: process.env.CONTACT_US_EMAIL,
      subject: 'Capicu -- Contact Us',
      html: html,
    });

    await this.mailerService.sendMail({
      to: process.env.CONTACT_US_EMAIL,
      subject: 'Capicu -- Contact Us',
      html: html,
    });

    return { message };
  }

  async getCoinExchangeListing(user, query) {
    const { page, limit, type } = query;

    let mongo_query = {
      userId: new ObjectId(user.id),
    };
    console.log('user==>', user);
    console.log('type-->', type);
    if (type && type != '') {
      mongo_query['type'] = type;
    }

    let data = await this.coinExchangeModel
      .find(mongo_query)
      .skip((page - 1) * (limit ? limit : 10))
      .limit(limit)
      .sort({ _id: -1 });
    console.log('data-->', data);
    let total_count = await this.coinExchangeModel.count(mongo_query);

    return { data, total_count };
  }

  async getCountryName(countryCode: string) {
    try {
      const countryRes = await axios.get(
        `https://restcountries.com/v2/alpha/${countryCode}`,
      );
      const country: string = countryRes?.data?.name || '';
      return country;
    } catch (error) {
      console.log(error.message);
      return '';
    }
  }

  paginate(data) {
    return {
      message: 'Data Fetched Successfully',
      data: data.data,
      page: {
        total: data.total_count,
        current_page: +data.current_page,
        next_page: +data.current_page + 1,
        last_page:
          Math.floor(data.total_count / data.limit) +
          (data.total_count % data.limit > 0 ? 1 : 0),
        previous_page: data.current_page > 1 ? data.current_page - 1 : null,
        per_page: data.limit,
      },
    };
  }

  async verifyTransaction(body, type = 'domicoins', userGameCenter = null) {
    try {
      console.log('=============', type);

      // mainnet
      // const rpcURL = ‘https://bsc-dataseed1.binance.org:443’;
      // testnet
      let rpcURL = '';
      let ethValue;
      if (body.network === process.env.BNB_CHAINID) {
        rpcURL = `${process.env.BLOCK_CHAIN_URL}`;
      } else {
        rpcURL = `${process.env.POLYGON_BLOCK_CHAIN_URL}`;
      }
      console.log('rpcurl=>>', rpcURL);

      // const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcURL);
      const customHttpProvider = new ethers.providers.JsonRpcProvider(rpcURL);
      const response = await customHttpProvider.getTransaction(body.hash);
      const { data, blockHash } = response;
      console.log('data-->', data);
      const isVerified = blockHash !== null;
      console.log('verifyTransaction', isVerified, response);
      if (isVerified) {
        const decodedResult = ethers.utils.defaultAbiCoder.decode(
          ['address', 'uint256'],
          ethers.utils.hexDataSlice(data, 4),
        );
        console.log('decodedResult=>>', decodedResult[0], decodedResult[1]);
        const receiver = decodedResult[0];
        const amount = decodedResult[1].toString();
        console.log('amount=>>', amount);

        if (body.network === process.env.BNB_CHAINID) {
          ethValue = ethers.utils.formatEther(amount);
        } else {
          ethValue = amount / 10 ** 6;
        }

        console.log('receiver-->', receiver);
        console.log('amount(ethValue)-->', ethValue);
        console.log('address-->', process.env.MARKETPLACE_WALLET_ADDRESS);
        let result = decodedResult.toString();

        if (
          await this.adminWalletAddress(
            response,
            receiver,
            type,
            userGameCenter,
            body,
          )
        ) {
          return this.verifyAmount(receiver, ethValue, type, userGameCenter);
        }

        return false;
      }
    } catch (error) {
      console.log('verifyTransaction', error);
      return false;
    }
  }

  async adminWalletAddress(response, receiver, type, userGameCenter, body) {
    let result = false;
    let contarctAddress = '';
    if (body.network === process.env.BNB_CHAINID) {
      contarctAddress = process.env.MARKETPLACE_WALLET_ADDRESS;
    } else {
      contarctAddress = process.env.POLYGON_CONTRACT_ADDRESS;
    }
    console.log('contract=>>', contarctAddress);

    switch (type) {
      case 'marketplace':
        result = true;
        break;
      case 'domicoins':
        result = response.to == contarctAddress;
        break;
      case 'game_center':
        if (receiver != contarctAddress) {
          let user = await this.userModel.findOne({
            _id: userGameCenter.ownerId,
          });
          let walletAddress;
          if (user.is_admin) {
            result =
              receiver == process.env.MARKETPLACE_WALLET_ADDRESS ||
              receiver == process.env.POLYGON_CONTRACT_ADDRESS;
          } else {
            walletAddress = user.metaMaskWalletAddress;
            result = receiver.toLowerCase() == walletAddress.toLowerCase();
          }
        } else {
          result = true;
        }
        // console.log(result);
        // console.log('response.to==walletAddress-->',receiver==walletAddress);
        // console.log('response.to-->',receiver);
        // console.log('walletAddress-->',walletAddress);
        break;
    }

    return result;
  }

  async verifyAmount(receiver, amount, type, userGameCenter) {
    if (type == 'domicoins') {
      return await this.convertUsdtToDomicoins(amount);
    }

    if (type == 'marketplace') {
      return amount;
    }
    if (type == 'game_center') {
      let marketplace = await this.marketPlaceModel.findOne({
        gameCenterId: userGameCenter._id,
        isSold: false,
        inventoryType: 'game-center',
        type: 'sell',
        userId: userGameCenter.ownerId,
      });
      console.log('maketplace=?>>', marketplace);
      return amount >= marketplace?.price;
    }
  }

  async getCategorySkinListing() {
    let categories = await this.assetBuilderService.getCategories({
      gender: 0,
    });

    let avatarBuilderCategory = await this.avatarBuilderCategoryModel.findOne({
      shortCode: 'skin',
    });

    return {
      categories,
      color: avatarBuilderCategory ? avatarBuilderCategory.data.color : [],
    };
  }

  async getUserAssetPercentage(character) {
    if (!character) {
      return 0;
    }

    const { mintedInventory, mintedCharacter } = character;

    let assetPercentages = await this.getAssetPercentages();

    let resultAvatar = await this.readFile(mintedCharacter.uri);

    let selectedAvatarPercentage = assetPercentages.find((obj) => {
      return obj.class === resultAvatar.itemclass;
    });

    let total_percentage = selectedAvatarPercentage.percentage;

    console.log(
      'total_percentage',
      selectedAvatarPercentage,
      total_percentage,
      resultAvatar.itemclass,
      assetPercentages,
    );

    let mintedInventoryData = mintedInventory.map(async (inventory) => {
      let result = await this.readFile(inventory.uri);

      let selectedPercentage = assetPercentages.filter(
        (percent) => percent.class == result.itemclass,
      );

      total_percentage += selectedPercentage[0]
        ? selectedPercentage[0].percentage
        : 0;
    });

    await Promise.all(mintedInventoryData);

    return total_percentage;
  }

  assignMedals(players, medalRanges, basePoints = 0) {
    return players.map((player) => {
      const { MMR } = player;
      const adjustedMMR = MMR + basePoints;
      const flooredMMR = Math.floor(adjustedMMR);
      const sortedMedalRanges = medalRanges.sort(
        (a, b) => a.medalRank - b.medalRank,
      );
      const matchingMedal = sortedMedalRanges.find((medal, i) => {
        if (i === 0 && medal.min > flooredMMR) {
          return true;
        }
        return (
          (flooredMMR >= medal.min &&
            (medal.max === null || flooredMMR <= medal.max)) ||
          (flooredMMR < 0 && medal.min === 0) // Check for negative MMR case
        );
      });
      if (!matchingMedal) {
        console.log(
          'matchingMedal not found',
          'players---->',
          players,
          'medalRanges---->',
          medalRanges,
          'basePoints---->',
          basePoints,
          'flooredMMR',
          flooredMMR,
        );
      }

      return {
        ...player,
        MMR: adjustedMMR,
        MMRwithoutBasePoints: MMR,
        medalName: matchingMedal?.medalName || sortedMedalRanges[0]?.medalName,
        medalRank: matchingMedal?.medalRank || sortedMedalRanges[0]?.medalRank,
      };
    });
  }

  getQuarterDates(inputDate: Date) {
    if (!inputDate || !(inputDate instanceof Date)) {
      throw new Error('Invalid date provided');
    }

    const month = inputDate.getMonth();
    let quarterStart, quarterEnd;
    if (month >= 0 && month <= 2) {
      quarterStart = new Date(inputDate.getFullYear(), 0, 1);
      quarterEnd = new Date(inputDate.getFullYear(), 2, 31, 23, 59, 59, 999);
    } else if (month >= 3 && month <= 5) {
      quarterStart = new Date(inputDate.getFullYear(), 3, 1);
      quarterEnd = new Date(inputDate.getFullYear(), 5, 30, 23, 59, 59, 999);
    } else if (month >= 6 && month <= 8) {
      quarterStart = new Date(inputDate.getFullYear(), 6, 1);
      quarterEnd = new Date(inputDate.getFullYear(), 8, 30, 23, 59, 59, 999);
    } else {
      quarterStart = new Date(inputDate.getFullYear(), 9, 1);
      quarterEnd = new Date(inputDate.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    return [quarterStart, quarterEnd];
  }

  async lastQuarter() {
    return await this.quarterModal
      .findOne({
        startDate: { $lte: new Date().getTime() },
      })
      .sort({ index: -1 });
  }

  // async createQuarter(date: Date) {
  //   const lastQuarter = await this.lastQuarter();

  //   // Make sure lastQuarter is not null before using its properties
  //   if (!lastQuarter) {
  //     throw new Error('No previous quarter found');
  //   }

  //   delete lastQuarter._id;

  //   let [startDate, endDate] = this.getQuarterDates(date);

  //   const newQuarter = {
  //     ...lastQuarter,
  //     index: lastQuarter.index + 1,
  //     GameModes: lastQuarter.GameModes,
  //     pointsTable: lastQuarter.pointsTable,
  //     startDate: startDate.getTime(),
  //     endDate: endDate.getTime(),
  //   };

  //   let createdQuarter = await this.quarterModal.create(newQuarter);

  //   let result = await this.userModel.updateMany(
  //     {},
  //     {
  //       $set: {
  //         'gameRuleInfo.GameMode1': 0,
  //         'gameRuleInfo.GameMode2': 0,
  //         'gameRuleInfo.GameMode3': 0,
  //         'gameRuleInfo.GameMode4': 0,
  //         'gameRuleInfo.GameMode5': 0,
  //         'gameRuleInfo.GameMode6': 0,
  //       },
  //     },
  //   );

  //   console.log('result---->', result);

  //   return createdQuarter;
  // }

  async createQuarter(date: Date) {
    const lastQuarter = await this.lastQuarter();
  
    // Make sure lastQuarter is not null before using its properties
    if (!lastQuarter) {
      throw new Error('No previous quarter found');
    }
  
    delete lastQuarter._id;
  
    let [startDate, endDate] = this.getQuarterDates(date);
  
    const newQuarter = {
      ...lastQuarter, // Convert to plain JavaScript object
      index: lastQuarter.index + 1,
      GameModes: lastQuarter.GameModes,
      pointsTable: lastQuarter.pointsTable,
      startDate: startDate.getTime(),
      endDate: endDate.getTime(),
    };
  
    try {
      let createdQuarter = await this.quarterModal.create(newQuarter);
  
      let result = await this.userModel.updateMany(
        {},
        {
          $set: {
            'gameRuleInfo.GameMode1': 0,
            'gameRuleInfo.GameMode2': 0,
            'gameRuleInfo.GameMode3': 0,
            'gameRuleInfo.GameMode4': 0,
            'gameRuleInfo.GameMode5': 0,
            'gameRuleInfo.GameMode6': 0,
          },
        },
      );
  
      console.log('Quarter created:', createdQuarter);
      console.log('result---->', result);
  
      return createdQuarter;
    } catch (error) {
      // Handle unique constraint violation
      console.error("error---->",error)
      if ((error as any).code === 11000 || (error instanceof Error && (error as any).code === 11000)) {
        const errorMessage = `Quarter with index ${newQuarter.index} already exists. Returning lastQuarter.`;
        console.error(errorMessage);
        return await this.lastQuarter();
      } else {
        // Other error
        console.error('Failed to create quarter:', error.message);
        throw new Error('Failed to create quarter');
      }
    }
  }
  

  async getCurrentQuarter(): Promise<any> {
    let quarter: any = await this.quarterModal.findOne({
      startDate: { $lte: new Date().getTime() },
      endDate: { $gte: new Date().getTime() },
    });

    if (!quarter) {
      quarter = await this.createQuarter(new Date());
    }

    return quarter;
  }

  async getQuarterFromDate(date: Date): Promise<any> {
    if (!date || !(date instanceof Date)) {
      throw new Error('Invalid date provided');
    }

    let quarter: any = await this.quarterModal.findOne({
      startDate: { $lte: date.getTime() },
      endDate: { $gte: date.getTime() },
    });

    if (!quarter) {
      quarter = await this.createQuarter(date);
    }

    return quarter;
  }

  async getClassFromURI(uri) {
    const classMatch = uri.match(/\/.\w{1,}.\//g);
    if (classMatch) {
      return classMatch.toString().replace(/\//g, '');
    } else {
      let result = await this.readFile(uri);
      return result.itemclass;
    }
  }

  async readFile(uri) {
    try {
      const res = await fetch(uri);

      if (res.status >= 400) {
        throw new Error('Bad response from server');
      }

      const result = await res.json();

      // console.log(result);

      return result;
    } catch (err) {
      console.error(err);
    }
  }

  async getAssetPercentages() {
    return this.assetPercentageModel.find();
  }

  async getAssetPrices(params = {}) {
    return this.assetPriceModel.findOne(params);
  }

  async getAssetPercentagesByClass(className) {
    return this.assetPercentageModel.findOne({ class: className });
  }

  async convertUsdtToDomicoins(usdt) {
    let coins = await this.coinModel.findOne({});
    return usdt * coins.domicoin;
  }

  async convertDomicoinsToUsdt(domicoins) {
    let coins = await this.coinModel.findOne({});
    return domicoins / coins.domicoin;
  }
}
