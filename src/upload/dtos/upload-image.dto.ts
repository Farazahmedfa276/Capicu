import { IsNotEmpty, IsNotEmptyObject } from 'class-validator';

export class UploadImageDto {
  @IsNotEmptyObject()
  file: "";
}
