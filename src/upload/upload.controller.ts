import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UploadService } from "./upload.service";

@ApiTags("Upload")
@Controller("upload")
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post("image")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      limits: { fileSize: 10000000 },
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.split("/")[0] !== "image" ||
          !["jpeg", "png", "jpg"].includes(file.mimetype.split("/")[1])
        ) {
          cb(
            new BadRequestException(
              "Invalid image, type must be in [jpeg, png, jpg]"
            ),
            false
          );
          return;
        }
        cb(null, true);
      },
    })
  )
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body("assetType") assetType: string
  ) {
    const message = "Upload Successful";
    const data = await this.uploadService.uploadImage(file);
    return { message, data: { ...data, assetType } };
  }

  
}
