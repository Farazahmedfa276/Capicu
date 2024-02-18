import { Injectable } from '@nestjs/common';
import { Cms, CmsDocument } from './cms.schema';
import { Model } from "mongoose";
import { BadRequestException, Body, NotFoundException } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class CmsService {
    constructor(
        @InjectModel(Cms.name)
        private cmsModel:Model<CmsDocument>
        ){}
    async getCms(slug){
        let cms = await this.cmsModel.findOne({slug:slug.slug})
        return cms
    }
}
