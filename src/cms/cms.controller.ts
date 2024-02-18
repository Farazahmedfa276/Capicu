import { Body, Controller, Get, Param } from "@nestjs/common";
import { CmsService } from './cms.service'
@Controller('cms')
export class CmsController {
    constructor(private cmsService:CmsService){}
    @Get('get-cms/:slug')
    async getCms(@Param() slug:string){
        return await this.cmsService.getCms(slug)
    }
}
