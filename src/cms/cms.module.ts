import { Module } from '@nestjs/common';
import { CmsService } from './cms.service';
import { CmsController } from './cms.controller';
import { Cms, CmsSchema } from './cms.schema';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cms.name, schema: CmsSchema },
    ]),
    
],
  providers: [CmsService],
  controllers: [CmsController]
})
export class CmsModule {}
