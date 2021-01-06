'use strict'

const fetch = require('node-fetch')

const platform = 'battle'

const baseURL = 'https://app.sbmmwarzone.com/'

const get = async (url) => {
    try {
        let res = await fetch(url)

        let jsonString = await res.text()

        let json = await JSON.parse(jsonString)

        return json
    } catch (e) {
        // console.log(e)
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
        // console.log(e)
    }

    return kdSum / match.data.players.length
}

const getLifetimeMatchKdAverage = async (username, usernumber) => {
    let matches = await getMatches(username, usernumber)

    let error = false
    let errorCount = 0

    let kdSum = 0

    try {
        for (let { id } of matches) {
            kdSum += await getAverageKdOfGame(await getMatch(id))
        }
    } catch (e) {
        // console.log(e)
        error = true
    }

    while (error) {
        error = false
        errorCount++

        await getLifetimeMatchKdAverage(username, usernumber)

        if (errorCount == 10) return null
    }

    return kdSum / matches.length
}

const fastify = require('fastify')({
    logger: true,
})

fastify.get('/averageMatchKd', async function (request, reply) {
    let username = request.query.username
    let usernumber = request.query.usernumber
    try {
        let result = await getLifetimeMatchKdAverage(username, usernumber)

        if (result == null) {
            return 'you did something wrong. Hans, is that you?'
        } else {
            return result
        }
    } catch (e) {
        // console.log(e)
        return 'you did something wrong. Hans, is that you?'
    }
})

// Run the server!
fastify.listen(process.env.PORT || 3000, '0.0.0.0', function (err, address) {
    if (err) {
        fastify.log.error(err)
        process.exit(1)
    }
    fastify.log.info(`server listening on ${address}`)
})
