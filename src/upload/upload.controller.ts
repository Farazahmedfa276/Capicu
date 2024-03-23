import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { UploadObjectDto } from './dtos/upload-object.dto';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10000000 },
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.split('/')[0] !== 'image' ||
          !['jpeg', 'png', 'jpg'].includes(file.mimetype.split('/')[1])
        ) {
          cb(
            new BadRequestException(
              'Invalid image, type must be in [jpeg, png, jpg]',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  async uploadImage(
    //@UploadedFile() file: Express.Multer.File,
    @Body('assetType') assetType: string,
  ) {
    const message = 'Upload Successful';
    //const data = await this.uploadService.uploadImage("");
    return { message, data: { } };
  }

  @Post('object')
  async uploadObject(@Body() body: UploadObjectDto) {
    const message = 'Upload Successful';
    const data = await this.uploadService.uploadObject(body);
    return { message, data };
  }
}
