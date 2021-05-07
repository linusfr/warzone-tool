'use strict'

const platform = 'battle'

const baseURL = 'https://app.wzstats.gg/v2/'

import { spacer, ranks, reversedRanks } from './src/ranks.js'

import { get } from './src/http.js'

const getPlayer = async (username, usernumber) => {
    console.log(
        `${baseURL}player?username=${username}%23${usernumber}&platform=${platform}`
    )
    return await get(
        `${baseURL}player?username=${username}%23${usernumber}&platform=${platform}`
    )
}

const getMatches = async (username, usernumber) => {
    return await get(
        `${baseURL}player/match?username=${username}%23${usernumber}&platform=${platform}`
    )
}

const getMatch = async (matchId) => {
    let match = await get(`${baseURL}?matchId=${matchId}`)

    return match
}

const getAverageKdOfGame = async (match) => {
    let kdSum = 0

    let dividend = match.data.players.length

    await match.data.players.forEach((player) => {
        try {
            kdSum += player.playerStat.lifetime.mode.br.properties.kdRatio
        } catch (e) {
            dividend -= 1
        }
    })

    return kdSum / dividend
}

const getLifetimeMatchKdAverage = async (username, usernumber) => {
    let matches = await getMatches(username, usernumber)

    let error = false

    let kdSum = 0

    try {
        for (let { id } of matches) {
            let match = await getMatch(id)

            kdSum += await getAverageKdOfGame(match)
        }
    } catch (e) {
        console.log(e)
        error = true
    }

    if (error) {
        await getLifetimeMatchKdAverage(username, usernumber)
    } else {
        let lifetimeKD = kdSum / matches.length

        return lifetimeKD
    }
}

const getLifeTimeAverageGameRank = async (averageKD) => {
    let index

    reversedRanks.forEach(({ KD }, rankIndex) =>
        averageKD >= KD ? (index = rankIndex) : null
    )

    return reversedRanks[index]
}

const getLobbyRank = async (matchID) => {
    let gameKD = await getAverageKdOfGame(await getMatch(matchID))

    let index

    reversedRanks.forEach(({ KD }, rankIndex) =>
        gameKD >= KD ? (index = rankIndex) : null
    )

    return reversedRanks[index]
}

const getLifetimeLobbyRanks = async (username, usernumber) => {
    let matches = await getMatches(username, usernumber)

    let error = false

    let gameRanks = []

    try {
        for (let { id } of matches) {
            let lobbyRank = await getLobbyRank(id)

            gameRanks.push(lobbyRank)
        }
    } catch (e) {
        console.log(e)
        error = true
    }

    if (error) {
        await getLifetimeLobbyRanks(username, usernumber)
    } else {
        return gameRanks
    }
}

const getInfo = async ({ username, usernumber }) => {
    let error = false

    try {
        let player = await getPlayer(username, usernumber)

        let lifetimeKD = await getLifetimeMatchKdAverage(username, usernumber)
        let { Name, KD } = await getLifeTimeAverageGameRank(lifetimeKD)
        let lifeTimeMatchRanks = await getLifetimeLobbyRanks(
            username,
            usernumber
        )
        let gamesPlayed = lifeTimeMatchRanks.length

        let playerProperties = player.data.lifetime.mode.br.properties

        let output = `${spacer}Player \n${username}#${usernumber}`

        output += `${spacer}` + JSON.stringify(playerProperties, null, 2)

        output +=
            `${spacer}KD Average of all Players over all Matches Played \n${lifetimeKD}` +
            `${spacer}Match Rank Average of over all Matches Played \nRank: ${Name} \nLowest Possible KD in the Rank: ${KD}` +
            `${spacer}Amount of Games played \n${gamesPlayed}`

        let simpleRanks = {
            Diamond: 0,
            Gold: 0,
            Silver: 0,
            Bronze: 0,
        }

        lifeTimeMatchRanks.forEach(({ Name, KD }) => {
            if (Name.split(' ')[0].includes('Diamond')) {
                simpleRanks.Diamond += 1
            } else if (Name.split(' ')[0].includes('Gold')) {
                simpleRanks.Gold += 1
            } else if (Name.split(' ')[0].includes('Silver')) {
                simpleRanks.Silver += 1
            } else if (Name.split(' ')[0].includes('Bronze')) {
                simpleRanks.Bronze += 1
            }
        })

        output += spacer
        output += `Diamond Lobbies: ${simpleRanks.Diamond}`
        output += `\nGold Lobbies: ${simpleRanks.Gold}`
        output += `\nSilver Lobbies: ${simpleRanks.Silver}`
        output += `\nBronze Lobbies: ${simpleRanks.Bronze}`

        console.log(output)
    } catch (e) {
        error = true
        console.log(e)
    }

    if (error) {
        getInfo(username, usernumber)
    }
}

const run = async () => {
    // let user = { username: 'HansanoMilch', usernumber: '2418' }
    // let user = { username: 'Csprle', usernumber: '2213' }
    let user = { username: 'DerKavalier', usernumber: '21507' }

    // let player = await getPlayer(user.username, user.usernumber)
    // let matches = await getMatches(user.username, user.usernumber)
    // let match = await getMatch(matches[0].id)

    // let output = match
    // console.log(JSON.stringify(output, null, 2))

    getInfo(user)
}

run()
