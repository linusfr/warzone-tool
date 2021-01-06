const fetch = require('node-fetch')

const username = 'HansanoMilch%232418'
const platform = 'battle'

const baseURL = 'https://app.sbmmwarzone.com/'

const get = async (url) => {
    let res = await fetch(url)

    let jsonString = await res.text()

    let json = await JSON.parse(jsonString)

    return json
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

    await match.data.players.forEach(
        (player) =>
            (kdSum += player.playerStat.lifetime.mode.br.properties.kdRatio)
    )

    let averageKd = kdSum / match.data.players.length

    return averageKd
}

const getLifetimeMatchKdAverage = async () => {
    let matches = await getMatches()

    let kdSum = 0

    for (let { id } of matches) {
        let kd = await getAverageKdOfGame(await getMatch(id))
        console.log(kd)
        kdSum += kd
    }

    let averageLifetimeKd = kdSum / matches.length

    console.log(averageLifetimeKd)
}

const doStuff = async () => await getLifetimeMatchKdAverage()

doStuff()
