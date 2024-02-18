import { Controller, Get, Param } from '@nestjs/common';
import {FaqsService} from './faqs.service'
@Controller('faqs')
export class FaqsController {
constructor(private faqsService:FaqsService){}
@Get('quest')
async getFaq(){
    return await this.faqsService.getFaq()
}
}
