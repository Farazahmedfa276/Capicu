import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Gender } from '../global/constants/gender.enum';

type CategoryItemsMember = {
  itemID: string;
  url: string;
  value: string;
  thumbnailURL: string;
};

type CategoryItems = {
  texture: Array<CategoryItemsMember>;
  mesh: Array<CategoryItemsMember>;
  color: Array<CategoryItemsMember>;
  blend: Array<CategoryItemsMember>;
};

type AvatarCategory = {
  _id: string;
  shortCode: string;
  data: CategoryItems;
};

type AssetCategory = {
  _id: string;
  shortCode: string;
  item: AssetCategoryItems;
};

type AssetCategoryItems = {
  itemShortCode: string;
  itemName: string;
  itemType: string;
  itemIcon: string;
  itemDesc: string;
  itemClass: string;
  itemPrice: object;
  itemTexUrls: Array<AssetCategoryItemsTextUrlsMember>;
};

type AssetCategoryItemsTextUrlsMember = {
  texId: string;
  texUrl: string;
  iconUrl: string;
};

export type MintedInventoryDto = {

  tokenId: string;
  uri: string;

}

let defaultUserWinnings = {
  GameMode1:0,
  GameMode2:0,
  GameMode3:0,
  GameMode4:0,
  GameMode5:0,
  GameMode6:0,
  totalEarning:0
}

let defaultGameRuleInfo = {
  GameMode1:0,
  GameMode2:0,
  GameMode3:0,
  GameMode4:0,
  GameMode5:0,
  GameMode6:0,
  totalEarning:0
}

type MobileVerifyCode = {
  code: string;
  expiresAt: Date;
}

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  profileImage: string;

  @Prop()
  avatar: string;

  @Prop({default:true})
  status:boolean

  @Prop({ default: [] })
  avatarCategories: Array<AvatarCategory>;

  @Prop({ default: [] })
  assetCategories: Array<AssetCategory>;

  @Prop({ type:{},default:null })
  character: CharacterDto;

  @Prop({ enum: Gender })
  avatarGender: Gender;

  @Prop({ enum: Gender })
  assetGender: Gender;

  @Prop()
  userName: string;

  @Prop()
  dateOfBirth: Date;

  @Prop({default:0})
  gameCenters:number

  @Prop({ enum: Gender, default:Gender.MALE })
  gender: Gender;

  @Prop({default:"US"})
  country: string;

  @Prop()
  flagShortCode: string;

  @Prop({ default: 1 })
  level: number;

  @Prop({ default: 0 })
  domicoins: number;

  @Prop()
  metaMaskWalletAddress: string;

  @Prop({ select: false })
  passwordResetCode: string;

  @Prop({ default: true })
  isEmailVerified: boolean;

  @Prop({type:Object,default: null,})
  mobileVerifyCode: MobileVerifyCode | null;

  @Prop({ select: false })
  password: string;

  @Prop({ select: false })
  isTermsOfServiceAndPrivacyPolicyAccepted: boolean;

  @Prop({ select: false })
  binanceWalletAddress: string;

  @Prop({ select: false })
  googleUserId: string;

  @Prop({})
  authProvider: string;

  @Prop({ select: false })
  emailVerificationId: string;

  @Prop({ default: 0 })
  blockTimer: number;

  @Prop({ default: 0 })
  blockCount: number;

  @Prop({ default: 0 })
  emailTimer: number;

  @Prop({ default: 0 })
  emailTimerCount: number;

  @Prop({ default: 0 })
  age: number;

  @Prop({ default: null })
  characterId: string;

  @Prop({ default: null })
  setPasswordToken: string;

  @Prop({ default: false })
  whiteListed: boolean;

  @Prop({ default: false })
  polygonWhiteListed: boolean;

  

  @Prop({
    default:
      'https://dominoes-images-preprod.s3.ap-southeast-1.amazonaws.com/prcuxueo0yld8vz0ja1674483047542.jpg',
  }
)
  profilePicUrl: string;

  @Prop({})
  defaultAvatarUrl: string;

  @Prop({ default: 1 })
  className: number;

  @Prop()
  accessToken: string;

  @Prop({ default: Date.now() })
  createdAt: Date;

  @Prop()
  assetPrices:[]

  @Prop()
  tokenURI:[]

  @Prop({default:false})
  is_admin:boolean

  @Prop({type:Object,default:defaultUserWinnings})
  userWinnings:UserWinningsDto

  @Prop({default:0})
  totalMatchesWon:number

  @Prop()
  discount:number;

  @Prop({type:Object,default:defaultGameRuleInfo})
  gameRuleInfo:gameRuleInfoDto
}

type CharacterDto = {

  mintedInventory: Array<MintedInventoryDto>,
  mintedGender: Gender,
  mintedCharacter: MintedInventoryDto,
  mintedAvatarName:string,
  mintedAvatarImageUrl:string,
  mintedAvatarClass:string,

}

type UserWinningsDto = {

  GameMode1:number,
  GameMode2:number,
  GameMode3:number,
  GameMode4:number,
  GameMode5:number,
  GameMode6:number,
  totalEarning:number
}

type gameRuleInfoDto = {

  GameMode1:number,
  GameMode2:number,
  GameMode3:number,
  GameMode4:number,
  GameMode5:number,
  GameMode6:number,
}



export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index(
  { userName: 1 },
  { unique: true, partialFilterExpression: { userName: { $exists: true } } },
);

UserSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { isEmailVerified: true },
  },
);
