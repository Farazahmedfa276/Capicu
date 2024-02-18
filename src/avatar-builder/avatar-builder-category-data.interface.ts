export interface IAvatarBuilderCategoryData {
  texture: Array<{
    itemID: string;
    url: string;
    value: string;
    thumbnailURL: string;
  }>;
  mesh: Array<{
    itemID: string;
    url: string;
    value: string;
    thumbnailURL: string;
  }>;
  color: Array<{
    itemID: string;
    url: string;
    value: string;
    thumbnailURL: string;
  }>;
  blend: Array<{
    itemID: string;
    url: string;
    value: string;
    thumbnailURL: string;
  }>;
}
