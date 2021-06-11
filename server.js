const express = require('express')
const fetch = require('node-fetch')
const redis = require('redis')

const PORT = process.env.PORT || 5000
const REDIS_PORT = process.env.REDIS_PORT || 6379
const app = express()
const client = redis.createClient(REDIS_PORT)
const BASE_URL = 'https://pokeapi.co/api/v2/pokemon/'

const setResponse = (details) => `<h1>${details}</h1>`

const getStats = async (req, res, next) => {
    try {
        console.log('Fetching...')
        const { id } = req.params
        const response = await fetch(`${BASE_URL}${id}`)
        const data = await response.json()

        const { name, height, weight } = data
        const pokeDetails = `Pokemon number ${id} is ${name}. They are ${height} decimetres tall and ${weight} hectograms heavy.`
        res.send(setResponse(pokeDetails))
    } catch (err) {
        console.error(err)
        res.status(500)
    }
}

const cache = (req, res, next) => {
    const { id } = req.params
    client.get(id, (err, data) => {
        if (err) throw err
        if (data) {
            res.send(setResponse(data))
        } else {
            next()
        }
    })
}

app.get('/pokemon/:id', getStats)

app.listen(PORT, () => console.log(`Example app listening on port ${PORT}`))