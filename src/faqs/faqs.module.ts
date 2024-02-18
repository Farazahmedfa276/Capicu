import { Module } from '@nestjs/common';
import { FaqsService } from './faqs.service';
import { FaqsController } from './faqs.controller';

import { Faq, FaqSchema } from './faqs.schema';
import { MongooseModule } from '@nestjs/mongoose';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Faq.name, schema: FaqSchema },
    ]),
    
],
  providers: [FaqsService],
  controllers: [FaqsController]
})
export class FaqsModule {}
