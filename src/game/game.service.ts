import { BadRequestException, Body, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User, UserDocument } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';
import { Game, GameDocument } from "./game.schema";

@Injectable()
export class GameService {

    constructor(
        @InjectModel(Game.name)
        private gameModel: Model<GameDocument>,
        
        private userService: UsersService,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
       
    ) { }


    async createGame(body) {


        let game = await this.gameModel.findOne({ _id: body.matchId })
        if (!game) {
        body.userIds = await this.convertUserIds(body.userIds)
        game = await this.gameModel.create(body);

        }

        

        game.createdAt = new Date();
        await game.save();
        console.log("creatGameDate", game);

        return game;
    }

    async convertUserIds(userIds) {

        userIds = userIds.map(async id => {

            let user = await this.userService.getUserById(id);
            return { id: id, userName: user.userName}
        })

        let data = await Promise.all(userIds);

        return data;

    }

   

    

    async endGame(body) {

        let game = await this.gameModel.findOne({ '_id': body.matchId });

        if (!game) {

            throw new NotFoundException("Game Not Found");

        }

        let winning_user: any = game.userIds.filter(user => user.id === body.winnerId)

        if (!winning_user.length) {

            throw new BadRequestException("This user is not in match");

        }
        game.winnerId = body.winnerId;
        

        await game.save()

        return game;

    }

    

    
    

}