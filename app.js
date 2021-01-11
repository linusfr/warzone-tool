'use strict'

const fetch = require('node-fetch')

const platform = 'battle'

const baseURL = 'https://app.sbmmwarzone.com/'

const get = async (url) => {
    let error = false

    let json

    try {
        let res = await fetch(url)
        let jsonString = await res.text()
        json = await JSON.parse(jsonString)
    } catch (e) {
        console.log(e)
        error = true
    }

    if (error) {
        get(url)
    } else {
        return json
    }
}

const getPlayer = async (username, usernumber) => {
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

    try {
        await match.data.players.forEach(
            (player) =>
                (kdSum += player.playerStat.lifetime.mode.br.properties.kdRatio)
        )
    } catch (e) {
        console.log(e)
    }

    return kdSum / match.data.players.length
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

const run = async () => {
    let error = false

    // let username = 'HansanoMilch'
    // let usernumber = '2418'
    // let username = 'Csprle'
    // let usernumber = '2213'
    let username = 'DerKavalier'
    let usernumber = '21507'

    try {
        let lifetimeKD = await getLifetimeMatchKdAverage(username, usernumber)
        let { Name, KD } = await getLifeTimeAverageGameRank(lifetimeKD)
        let lifeTimeMatchRanks = await getLifetimeLobbyRanks(
            username,
            usernumber
        )
        let gamesPlayed = lifeTimeMatchRanks.length

        let output =
            `${spacer}Player \n${username}#${usernumber}` +
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
    }

    if (error) {
        run()
    }
}

const spacer = `\n--------------------------------------------------\n`

const ranks = [
    { Name: 'Diamond 1', KD: 1.234 },
    { Name: 'Diamond 2', KD: 1.204 },
    { Name: 'Diamond 3', KD: 1.18 },
    { Name: 'Diamond 4', KD: 1.159 },
    { Name: 'Diamond 5', KD: 1.139 },
    { Name: 'Gold 1', KD: 1.118 },
    { Name: 'Gold 2', KD: 1.098 },
    { Name: 'Gold 3', KD: 1.077 },
    { Name: 'Gold 4', KD: 1.056 },
    { Name: 'Gold 5', KD: 1.036 },
    { Name: 'Silver 1', KD: 1.015 },
    { Name: 'Silver 2', KD: 0.99 },
    { Name: 'Silver 3', KD: 0.967 },
    { Name: 'Silver 4', KD: 0.941 },
    { Name: 'Silver 5', KD: 0.913 },
    { Name: 'Bronze 1', KD: 0.979 },
    { Name: 'Bronze 2', KD: 0.839 },
    { Name: 'Bronze 3', KD: 0.79 },
    { Name: 'Bronze 4', KD: 0.592 },
    { Name: 'Bronze 5', KD: 0 },
]

const reversedRanks = ranks.sort().reverse()

run()
