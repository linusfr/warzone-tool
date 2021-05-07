import fetch from 'node-fetch'

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

export { get }
