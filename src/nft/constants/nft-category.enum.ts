export enum NFTCategory {
  UPPER = 'upper',
  LOWER = 'lower',
  SOCKS = 'socks',
  SHOES = 'shoes',
  GLASSES = 'glasses',
  TATTOO = 'tattoo',
  CAP = 'cap',
  JEWELLERY = 'jewellery',
  AVATAR = 'avatar',
}

export enum NFTCategoryIdMostSignificantDigit {
  upper = 1,
  lower = 2,
  socks = 3,
  shoes = 4,
  glasses = 5,
  tattoo = 6,
  cap = 7,
  jewellery = 8,
  avatar = 9,
}

export const NFTTokenMostSignificantDigitToCategoryMap: {
  [key: string]: string;
} = {
  '1': 'upper',
  '2': 'lower',
  '3': 'socks',
  '4': 'shoes',
  '5': 'glasses',
  '6': 'tattoo',
  '7': 'cap',
  '8': 'jewellery',
  '9': 'avatar',
};
