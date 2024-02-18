import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { nanoid } from 'nanoid';
import { UploadObjectDto } from './dtos/upload-object.dto';

@Injectable()
export class UploadService {
  private s3: AWS.S3;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
  }

  // async uploadImage(file: Express.Multer.File) {
  //   if (
  //     file.mimetype.split('/')[0] !== 'image' ||
  //     !['jpeg', 'png', 'jpg'].includes(file.mimetype.split('/')[1])
  //   ) {
  //     throw new BadRequestException(
  //       'Invalid image, type must be in [jpeg, png, jpg]',
  //     );
  //   }

  //   const file_name = `${nanoid()}.${file.mimetype.split('/')[1]}`;

  //   const uploadedImage = await this.s3
  //     .upload({
  //       Bucket: this.configService.get<string>('S3_BUCKET'),
  //       Key: file_name,
  //       Body: file.buffer,
  //       ACL: 'public-read',
  //     })
  //     .promise();

  //   return { file_name: file.originalname, file_url: uploadedImage.Location };
  // }

  async uploadObject(uploadObjectDto: UploadObjectDto) {
    const { data } = uploadObjectDto;

    const urls = data.map(async (data: object) => {
      const file_name = `${data['itemclass']?data['itemclass']:''}/${nanoid()}.json`;

      await this.s3
        .putObject({
          Bucket: this.configService.get<string>('S3_BUCKET'),
          Key: `${file_name}`,
          Body: JSON.stringify(data),
          ContentType: 'application/json',
          ACL: 'public-read',
        })
        .promise();

      return `https://${this.configService.get<string>(
        'S3_BUCKET',
      )}.s3.amazonaws.com/${file_name}`;
    });

    return await Promise.all(urls);
  }
}
