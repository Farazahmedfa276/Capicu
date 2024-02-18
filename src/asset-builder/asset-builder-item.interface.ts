export interface IAssetBuilderCategoryItem {

    
        itemShortCode : string,
        itemName : string,
        itemType : string,
        itemClass : string,
        itemIcon:string,
        itemDesc: string,
        itemPrice : {
            chain : string,
            chainPrice : number,
            usdt : number
        },
        itemTexUrls : Array<{texUrl : string,iconUrl : string,texId : string}>
        
  }
  