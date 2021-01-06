const fetch = require('node-fetch')

const username = 'HansanoMilch%232418'
const platform = 'battle'

const baseURL = 'https://app.sbmmwarzone.com/'

const get = async (url) => {
    try {
        let res = await fetch(url)

        let jsonString = await res.text()

        let json = await JSON.parse(jsonString)

        return json
    } catch (e) {
        console.log(e)
    }
}

const getPlayer = async () => {
    return await get(
        `${baseURL}player?username=${username}&platform=${platform}`
    )
}

const getMatches = async () => {
    return await get(
        `${baseURL}player/match?username=${username}&platform=${platform}`
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

const getLifetimeMatchKdAverage = async () => {
    let matches = await getMatches()

    let error = false

    let kdSum = 0

    try {
        for (let { id } of matches) {
            kdSum += await getAverageKdOfGame(await getMatch(id))
        }
    } catch (e) {
        console.log(e)
        error = true
    }

    return error ? null : kdSum / matches.length
}

const doStuff = async () => {
    let res = null
    while (res == null) {
        res = await getLifetimeMatchKdAverage()
    }
    console.log(res)
}

doStuff()
