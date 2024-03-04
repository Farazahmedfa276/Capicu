
import { BadRequestException, Body, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

import { User, UserDocument } from 'src/users/user.schema';
import { UsersService } from 'src/users/users.service';
import { GameStatus } from "./constants/game-status.enum";
import { GameType } from './constants/game-type.enum';
import { Game, GameDocument } from "./game.schema";
import { Quarter, QuarterDocument } from "./quarter.schema"

@Injectable()
export class GameService {

    constructor(
        @InjectModel(Game.name)
        private gameModel: Model<GameDocument>,
        
        private userService: UsersService,
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(Quarter.name)
        private quarterModal: Model<QuarterDocument>
    ) { }

    async getAvailableTournamentGame(tournament, user) {

        let game = await this.gameModel.findOne({ tournamentId: tournament.id, round: 1, userIds: { "$not": { $size: tournament.noOfPlayers } } }).sort({ matchNumber: 1 });

        if (!game) {

            throw new BadRequestException("Tournament Full");

        }

        let user_obj = {
            'id': user['_id'].toString(),
            'name': user.userName ? user.userName : user.firstName + ' ' + user.lastName,
        }

        game.userIds.push(user_obj);

        await game.save();

        return game;

    }

    async exitTournamentGame(tournament, user) {

        let game = await this.gameModel.findOne({ tournamentId: tournament.id, round: 1, 'userIds.id': user.id });
        if (!game) {

            throw new BadRequestException("User Not Found");

        }

        game.userIds = game.userIds.filter(function (item) {
            return item.id !== user['_id'].toString();
        });

        await game.save();

        return game;

    }

    

    getGameTime(tournament, round) {

        let game_time = new Date(tournament.tournamentStartDate).getTime() + ((round - 1) * 24 * 60 * 60 * 1000)

        return game_time;

    }

    getGameTimeDifference(time) {

        let current_date = new Date().getTime();

        let dif = (time - current_date);

        dif = Math.round((dif / 1000) / 60);

        return dif;

    }

    async createGame(body) {


        let game = await this.gameModel.findOne({ _id: body.matchId })
        if (!game) {
         const usersWithEnoughCoins = await this.userModel.find({
            "_id": { $in: body.userIds },
            "domicoins": { $gte: body.coins }
          });
          if (usersWithEnoughCoins.length !== body.userIds.length) {
            throw new BadRequestException("insufficient Domicoins")
          }
        await this.userModel.updateMany({ "_id": { $in: body.userIds } }, { $inc: { domicoins: -(body.coins) } })
        body.userIds = await this.convertUserIds(body.userIds)
        game = await this.gameModel.create(body);

        }

        

        game.status = GameStatus.STARTED
        game.startTime = new Date().getTime();
        game.createdAt = new Date();
        await game.save();
        console.log("creatGameDate", game);

        return game;

    }

    async convertUserIds(userIds) {

        userIds = userIds.map(async id => {

            let user = await this.userService.getUserById(id);

            return { id: id, character: user.character }
        })

        let data = await Promise.all(userIds);

        return data;

    }

   

    

    addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result.getTime();
    }

    getPreviousMatchesTotal(tournament, round_number) {

        round_number = round_number - 1;

        let totalMatchNumber = 0;

        while (round_number) {

            let no_of_matches = Math.pow(tournament.noOfPlayers, tournament.noOfStages) / Math.pow(tournament.noOfPlayers, round_number);

            totalMatchNumber += no_of_matches;

            round_number--;

        }

        return totalMatchNumber;

    }

    getNextMatch(tournament, round_number) {

        return this.getPreviousMatchesTotal(tournament, round_number + 1)

    }

    async generateMatches(data) {

        for (let i = 0; i < data.no_of_matches; i++) {

            let match_number = i + data.previousMatchesTotal + 1;

            let previousTotal = this.getPreviousMatchesTotal(data.tournament, data.i + 1);

            let nextMatch = previousTotal + ((i + 1) / data.tournament.noOfPlayers)
            nextMatch = Math.ceil(nextMatch)

            let users_array = data.users.slice(i * data.tournament.noOfPlayers, (i + 1) * data.tournament.noOfPlayers);

            users_array = users_array.map(user => {

                return {
                    'id': user.user['_id'].toString(),
                    'name': user.user.firstName,
                    'character': user.user.character
                }

            })

            let game_obj = {
                'coins': data.tournament.entryFee,
                'noOfPlayers': data.tournament.noOfPlayers,
                'tournamentId': data.tournament.id,
                'gameType': GameType.TOURNAMENT,
                'gameRule': data.tournament.rule,
                'status': GameStatus.OPEN,
                'userIds': users_array,
                'matchNumber': match_number,
                'round': data.i,
                'nextMatchNumber': nextMatch,
                'matchDate': this.getGameTime(data.tournament, data.i)
            }

            await this.gameModel.create(game_obj);

        }

    }

    async updateMatchDate(tournament) {

        for (let i = 1; i <= tournament.noOfStages; i++) {
            let gameTime = this.getGameTime(tournament, i);
            await this.gameModel.updateMany({ tournamentId: tournament.id, round: i },
                { $set: { matchDate: gameTime } }
            )
        }


    }

    getUserIds(body, game) {

        if (body.player_id) {
            game.user_ids.push(body.player_id);
        }
        else {
            game.user_ids = body.user_ids;
        }

        return game;

    }

    async getGamesPlayedOfNft(tokenId) {

        return this.gameModel.count({ 'userIds.character.mintedCharacter.tokenId': tokenId });

    }

    async checkNumberOfPlayers(body, game) {

        if (game.user_ids.length === game.no_of_players) {
            throw new BadRequestException("Game Already Full");
        }

    }

    assignDefaultScores(game_mode, winnerId, users) {
        const result = [];
    
        switch (game_mode) {
            case 'GameMode1':
                users.forEach(user => {
                    const player = {
                        "playerUserID": user.id,
                        "playerScore": user.id === winnerId ? 200 : 0
                    };
                    result.push(player);
                });
                break;
    
            case 'GameMode2':
                users.forEach(user => {
                    const player = {
                        "playerUserID": user.id,
                        "playerScore": user.id === winnerId ? 0 : 121
                    };
                    result.push(player);
                });
                break;
    
            case 'GameMode3':
                users.forEach(user => {
                    const player = {
                        "playerUserID": user.id,
                        "playerScore": user.id === winnerId ? 100 : 0
                    };
                    result.push(player);
                });
                break;
    
            case 'GameMode4':
                users.forEach(user => {
                    const player = {
                        "playerUserID": user.id,
                        "playerScore": user.id === winnerId ? 20 : 0
                    };
                    result.push(player);
                });
                break;
    
            case 'GameMode5':
                users.forEach(user => {
                    const player = {
                        "playerUserID": user.id,
                        "playerScore": user.id === winnerId ? 0 : 25
                    };
                    result.push(player);
                });
                break;
    
            case 'GameMode6':
                users.forEach(user => {
                    const player = {
                        "playerUserID": user.id,
                        "playerScore": user.id === winnerId ? 75 : 0
                    };
                    result.push(player);
                });
                break;
    
            default:
                console.error("Invalid game mode");
        }
    
        return result;
    }

    defaultScoreForGameMode(gameMode) {
        switch (gameMode) {
            case 'GameMode1':
                return 200;
                break;
            case 'GameMode2':
                return 121;
                break;
            case 'GameMode3':
                return 100;
                break;
            case 'GameMode4':
                return 20;
                break;
            case 'GameMode5':
                return 25;
                break;
            case 'GameMode6':
                return 75;
                break;
            default:
                return 0; 
                break;
        }
    }
    
    async endGame(body) {

        let game = await this.gameModel.findOne({ '_id': body.matchId, status: GameStatus.STARTED });

        if (!game || game.status == GameStatus.ENDED) {

            throw new NotFoundException("Game Not Found");

        }

        let winning_user: any = game.userIds.filter(user => user.id === body.winnerId)

        if (!winning_user.length) {

            throw new BadRequestException("This user is not in match");

        }
        game.winnerId = body.winnerId;
        

        
         

            let user = await this.userService.getUserById(body.winnerId);

            let userPercentage = 50;

            let winnings = await this.calculateWinning({ winner: user, userPercentage, total_prize: game.coins * game.userIds.length, character: winning_user[0].character })

            if (user.userWinnings[game.gameRule]) {
                user.userWinnings[game.gameRule] += winnings['winner_prize'];
            } else {
                user.userWinnings[game.gameRule] = winnings['winner_prize'];
            }


            user.userWinnings['totalEarning'] += winnings['winner_prize']

            user.domicoins += winnings['winner_prize'];

            game.userShare = winnings['winner_prize'];

            game.duration = this.millisToMinutesAndSeconds(new Date().getTime() - game.startTime);

            //game.gameCenterShare = winnings['game_center_share'];

            await this.userModel.updateOne({ "_id": user._id }, { $set: { userWinnings: user.userWinnings, domicoins: user.domicoins } })

            //await this.gameCenterShare(game, winnings['game_center_share']);

            //await this.adminShare(winnings['admin_share']);
        

        // console.log("game-------->",game)
        
        await game.save()

        return game;

    }

    findHighestRankedLoserId(playersMedal, medals, winnerId) {
        let highestMedalRank = 0;
        let playerWithHighestMedalId = null;
        playersMedal = playersMedal.filter(({ id }) => id !== winnerId)
        playersMedal.forEach(playerMedal => {
            const medal = medals.ranges.find(m => m.medalName === playerMedal.medalName);
            if (medal.medalRank > highestMedalRank) {
                highestMedalRank = medal.medalRank;
                playerWithHighestMedalId = playerMedal.id;
            }
        });
        return playerWithHighestMedalId;
    }

    async calculateFinalPoints(players, playersMedal, winnerId, medals, rewardPenaltyTable, gameRule) {
        const HighestRankedLoserId = this.findHighestRankedLoserId(playersMedal, medals, winnerId)
        const { HighestScorerId, HighestScore, LowestScore , LowestScorerId ,totalGameScore } = this.findScorersInfo(players)
        const findPlayerById = (id) => ({ id, pointsWon: players.find(v => v.id == id).pointsWon, medalName: playersMedal.find(v => v.id == id).medalName, medalRank: medals.ranges.find((v) => v.medalName == playersMedal.find(v => v.id == id).medalName).medalRank, MMR: playersMedal.find(v => v.id == id).MMR })
        return await players.map(async ({ id, pointsWon }) => {
            let initialPoints = findPlayerById(id).pointsWon;
            

            if (gameRule == "GameMode2" || gameRule == "GameMode5") {
                if (id === winnerId) {
                    pointsWon = totalGameScore + (totalGameScore * ((rewardPenaltyTable[findPlayerById(HighestRankedLoserId).medalName][findPlayerById(id).medalName])/100))
                } else {
                    pointsWon = pointsWon - (pointsWon * ((rewardPenaltyTable[findPlayerById(winnerId).medalName][findPlayerById(id).medalName])/100))
                    pointsWon = -pointsWon
                }
            } else {
                if (id === winnerId) {
                    pointsWon = pointsWon + (pointsWon * ((rewardPenaltyTable[findPlayerById(HighestRankedLoserId).medalName][findPlayerById(id).medalName])/100))
                } else {
                    pointsWon = findPlayerById(id).pointsWon - findPlayerById(winnerId).pointsWon
                    pointsWon = pointsWon - (pointsWon * ((rewardPenaltyTable[findPlayerById(winnerId).medalName][findPlayerById(id).medalName]) / 100))
                }
            }
            
    
            // await this.userModel.updateOne({ _id: id }, { '$set': { [`gameRuleInfo.${gameRule}`]: findPlayerById(id).MMR + pointsWon } })
            await this.userModel.updateOne({ _id: id }, { '$inc': { [`gameRuleInfo.${gameRule}`]: pointsWon } })
            return { id, finalPoints: pointsWon ?? 0, medalRank: findPlayerById(id).medalRank, medalName: findPlayerById(id).medalName, initialPoints, MMR: findPlayerById(id).MMR }  

        })
    }

    async leaderBoard(query) {
        
        return {  };
        // return { data:[], total_count:10, current_page, limit };
    }

    findScorersInfo(data) {
        if (data.length === 0) {
            return {
                HighestScorerId: null,
                HighestScore: null,
                LowestScorerId: null,
                LowestScore: null,
                totalGameScore: 0
            };
        }
    
        const initialObj = {
            HighestScorerId: data[0].id,
            HighestScore: data[0].pointsWon,
            LowestScorerId: data[0].id,
            LowestScore: data[0].pointsWon,
            totalGameScore: 0
        };
    
        const scorersInfo = data.reduce((scorers, currentScorer) => {
            if (currentScorer.pointsWon > scorers.HighestScore) {
                scorers.HighestScorerId = currentScorer.id;
                scorers.HighestScore = currentScorer.pointsWon;
            }
    
            if (currentScorer.pointsWon < scorers.LowestScore) {
                scorers.LowestScorerId = currentScorer.id;
                scorers.LowestScore = currentScorer.pointsWon;
            }
    
            scorers.totalGameScore += currentScorer.pointsWon;
    
            return scorers;
        }, initialObj);
    
        return scorersInfo;
    }

    millisToMinutesAndSeconds(millis) {
        let minutes = Math.floor(millis / 60000);
        let seconds = ((millis % 60000) / 1000).toFixed(0);
        return minutes + ":" + (+seconds < 10 ? '0' : '') + seconds;
    }

   

    async getTournamentGamesWithSingleUsers() {

        let currentDate = new Date().getTime();
        console.log(currentDate, 'current');
        return await this.gameModel.find({ tournamentId: { $exists: true }, status: GameStatus.OPEN, userIds: { $size: 1 }, matchDate: { $lt: currentDate } })

    }

    addMinutes(minutes) {
        let current_date = new Date();
        return new Date(current_date.getTime() + minutes * 60000);
    }

    async joinGame(body) {

        let game = await this.gameModel.findOne({ "_id": body.matchId, "status": GameStatus.OPEN });

        if (!game) {

            throw new NotFoundException("Game Not Found");

        }

        let user: any = game.userIds.find(user => user.id === body.userId)

        let user_exists = game.usersJoined.find(user => user.id === body.userId);

        let joinObj = {
            id: body.userId,
            joinExpiration: this.addMinutes(2).getTime()
        }

        if (user && !user_exists) {
            await this.gameModel.updateOne({ "_id": game._id }, {
                $push: { usersJoined: joinObj }
            })
        }

        let test = game.usersJoined[0]  ? game.usersJoined[0]?.joinExpiration - (2 * 60 * 1000) : new Date().getTime()
        
        return { "message": "Game Joined"  , joinTimeOfFirstUser : test   , serverTime : new Date().getTime() }
    }

    async checkWaitingQueue(data, user) {

        let game = await this.gameModel.findOne({ "_id": data.matchId, status: GameStatus.OPEN });

        if (!game) {

            throw new NotFoundException("Game Not Found")

        }

        if (!game.usersJoined.length) {
            return;
        }

        if (game.usersJoined.length == 1) {
            return await this.makeWinner(game, user)
        }

        let otherUsersInQueue = game.usersJoined.filter(userJoined => {
            return userJoined.id != user.id && this.getGameTimeDifference(userJoined.joinExpiration) <= 2 && this.getGameTimeDifference(userJoined.joinExpiration) > 0
        });
        console.log('otherUsersInQueue-->', otherUsersInQueue);

        if (otherUsersInQueue.length) {
            game.usersJoined.splice(game.usersJoined.findIndex(userJoined => userJoined.id == user.id))
            await game.save();
            let joinObj = {
                id: user.id,
                joinExpiration: this.addMinutes(2).getTime()
            }

            await this.gameModel.updateOne({ "_id": data.matchId }, {
                $push: { usersJoined: joinObj }
            })
            return { isWinner: false }
        }

        return await this.makeWinner(game, user)


    }

    async graph(query, user) {

        let data = await this.generateGraphData(query, user);

        data = await this.manipulateData(data, query, user)

        return data;

    }

    async manipulateData(data, query, user) {

        let xAxis = this.getXAxis(query.type);

        let points = [];

        data.sort((a, b) => {
            return a._id - b._id;
        })
        for (let i = 0; i < xAxis.length; i++) {

            if (query.type == 'monthly') {

                let point = data.find(d => d._id == xAxis[i]);
                points.push(point ? point.points : 0);
                continue;

            }

            let point = data.find(d => d._id == i);
            points.push(point ? point.points : 0);
        }

        let totalCount = await this.getTotalEarning(query, user);

        return { xAxis, points, totalCount };

    }

    async getTotalEarning(query, user) {
        let mongo_query = query.gameCenterId ? { gameCenter: query.gameCenterId } : { winnerId: user.id }

        let sumCount = query.gameCenterId ? "$gameCenterShare" : "$userShare";

        let total_count = await this.gameModel.aggregate([
            {
                $match: mongo_query
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: sumCount }
                }
            }
        ])

        return total_count.length ? total_count[0].total : 0;
    }

    getNumberOfWeeksInMonth() {
        // Create a new Date object for the current date
        const currentDate = new Date();

        const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

        // Get the first day of the current month
        const firstWeekNumber = Math.ceil((firstDayOfMonth.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        const lastWeekNumber = Math.ceil((lastDayOfMonth.getTime() - new Date(currentDate.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

        // Initialize an array to hold the week numbers
        const weekNumbers = [];

        // Loop through the weeks of the month and add the week numbers to the array
        for (let i = firstWeekNumber; i <= lastWeekNumber; i++) {
            weekNumbers.push(i);
        }

        return weekNumbers;

    }

    makeQuery(query, user) {

        let mongo_query = query.gameCenterId ? { gameCenter: query.gameCenterId } : { winnerId: user.id }

        switch (query.type) {
            case 'weekly': {
                let dates = this.getCurrentWeekDate();
                mongo_query['createdAt'] = { $gte: dates.startDate, $lte: dates.endDate }
                break;
            }
            case 'monthly': {
                let dates = this.getCurrentMonthDate();
                mongo_query['createdAt'] = { $gte: dates.startDate, $lte: dates.endDate }
                break;

            }
            case 'yearly': {
                let dates = this.getCurrentYearDate();
                mongo_query['createdAt'] = { $gte: dates.startDate, $lte: dates.endDate }
                break;

            }
        }

        return mongo_query


    }

    async generateGraphData(query, user) {

        const { type } = query;

        let mongo_query = this.makeQuery(query, user);

        let sumCount = query.gameCenterId ? "$gameCenterShare" : "$userShare";

        let data;
        console.log('mongo_query-->', mongo_query);
        switch (type) {
            case 'weekly': {
                data = await this.gameModel.aggregate([
                    {
                        $match: mongo_query
                    },
                    {
                        $group: {
                            _id: { $dayOfWeek: "$createdAt" },
                            points: { $sum: sumCount }
                        }
                    }
                ])
                break;
            }

            case 'monthly': {
                data = await this.gameModel.aggregate([
                    {
                        $match: mongo_query
                    },
                    {
                        $group: {
                            _id: { $week: "$createdAt" },
                            points: { $sum: sumCount }
                        }
                    }
                ])
                break;
            }

            case 'yearly': {
                data = await this.gameModel.aggregate([
                    {
                        $match: mongo_query
                    },
                    {
                        $group: {
                            _id: { $month: "$createdAt" },
                            points: { $sum: sumCount }
                        }
                    }
                ])
                break;
            }
        }

        return data;

    }

    getCurrentWeekDate() {

        const today = new Date();

        // Calculate the start date of the week (Sunday)
        const startDate = new Date(today.setDate(today.getDate() - today.getDay()));

        // Calculate the end date of the week (Saturday)
        const endDate = new Date(today.setDate(today.getDate() - today.getDay() + 6));

        return { startDate, endDate };

    }

    getXAxis(type) {

        switch (type) {

            case 'weekly':
                return ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            case 'monthly':
                return this.getNumberOfWeeksInMonth();
            case 'yearly':
                return ['Jan', 'Feb', 'March', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']


        }

    }

    getCurrentMonthDate() {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 1);

        return { startDate, endDate };
    }

    getCurrentYearDate() {
        const today = new Date();
        const year = today.getFullYear();

        const startDate = new Date(year, 1, 1);
        const endDate = new Date(year + 1, 1, 1);

        console.log(startDate)
        console.log(endDate)

        return { startDate, endDate };
    }

    
    
    async makeWinner(game, user) {

        game.status = GameStatus.STARTED;
        await game.save();
        
        await this.endGame({ matchId: game.id, winnerId: user.id , players : this.assignDefaultScores(game.gameRule,user.id,game.userIds) })
        return { isWinner: true }

    }

    async getGames(query, user) {

        const { page, limit } = query;
        let mongo_query = {
            tournamentId: { $exists: false },
            userIds: { $elemMatch: { id: user.id } }
        };
        console.log('mongo_query-->', mongo_query);
        let data = await this.gameModel
            .find(mongo_query)
            .sort({ _id: -1 })
            .skip((page - 1) * (limit ? limit : 0))
            .limit(limit);

        let total_count = await this.gameModel
            .count(mongo_query)
        return { data, total_count };

    }

    

    async calculateWinning(data) {

        let winner_prize = data.total_prize * (data.userPercentage / 100);
        console.log("TESTING", "winner_prize 1", winner_prize);

        console.log(winner_prize, '<--winner_prize')

        // let rentedInventories = await this.marketPlaceService.getRentedPercentage(tournamentPlayer.user.character,winner_prize);

        const rented_prize = await this.deductRent(data.winner._id, data.character, data.total_prize)
        winner_prize -= rented_prize;

        //console.log("TESTING", "rented_prize", rented_prize);

        data.total_prize = data.total_prize - winner_prize - rented_prize;

        console.log(data.total_prize, '<--total_prize')

        let admin_share = data.total_prize * (15 / 100);

        console.log(admin_share, 'admin_share')

        let game_center_share = data.total_prize * (85 / 100);

        console.log(game_center_share, 'game_center_share')

        console.log("TESTING", "winner_prize 2", winner_prize);

        return { winner_prize, rented_prize, game_center_share, admin_share };

    }

    

    async adminShare(admin_share) {
        let admin_user = await this.userService.getAdminUser()
        console.log('admin_share-->', admin_share);
        admin_user.domicoins += admin_share;

        await admin_user.save()
    }

    

    

    async userGame(id: string) {

        let game_id = await this.gameModel.findOne({ '_id': id })
        if (!game_id) {
            throw new NotFoundException('Game not found');
        }
        return game_id;

    }

    async getgamesByTournament(tournament_id, round_number = null) {

        let games = await this.gameModel.find({ 'tournamentId': tournament_id, round: round_number }).sort({ matchNumber: 1 })

        return games;
    }

    async getTournamentsLastGame(tournament_id) {

        let game = await this.gameModel.findOne({ 'tournamentId': tournament_id }).sort({ 'matchNumber': -1 });

        if (!game) {

            throw new BadRequestException("Invalid Tournament")

        }
        if(!game?.winnerId){
            throw new BadRequestException("Tournament Has not been finished")
        }

        return game;
    }

    async deductRent(winner, character, pool_price) {
        console.log("TESTING", "deductRent", "pool_price", pool_price);

        const { mintedInventory, mintedCharacter } = character;
        let rtn_price = 0;

        console.log('price before-->', rtn_price);
        
        console.log('price after-->', rtn_price);
        

        console.log("TESTING", "deductRent", "rtn_price", rtn_price);

        return rtn_price;

    }

    

}