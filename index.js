const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
require('dotenv').config()

const authRouter = require('./routers/authRouter')
const habitRouter = require('./routers/habitRouter')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('build'))
app.use(cookieParser())
app.use('/', authRouter)
app.use('/', habitRouter)

app.get('/', (req, res) => {
    res.sendFile(__dirname + 'index.html')
})

async function start() {
    try {
        mongoose.set('strictQuery', false)
        await mongoose.connect(process.env.DB)
        app.listen(process.env.PORT)
    } catch {
        console.log('db connection failed')
    }
}

start()