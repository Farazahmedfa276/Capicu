import { IsArray } from 'class-validator';

export class UploadObjectDto {
  @IsArray()
  data: any;
}
