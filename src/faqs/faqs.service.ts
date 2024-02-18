import { Injectable } from '@nestjs/common';
import { Faq, FaqDocument } from './faqs.schema';
import { Model } from "mongoose";
import { BadRequestException, Body, NotFoundException } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class FaqsService {
    
    constructor(
        @InjectModel(Faq.name)
        private faqModel:Model<FaqDocument>
    ){}
    async getFaq(){
        let faq = await this.faqModel.find({})
        return {faqs:faq};
    }
}
