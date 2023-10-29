const express = require('express')
const mongoose = require('mongoose')
const app = express()
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
require('dotenv').config()

// Prometheus
const prometheus = require('prom-client')
// Create a Prometheus metric for tracking HTTP requests
const httpRequestCounter = new prometheus.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests handled by the application',
    labelNames: ['method', 'path', 'status'],
});
// Middleware to increment the HTTP request counter
app.use((req, res, next) => {
    const originalEnd = res.end;

    res.end = (chunk, encoding) => {
        httpRequestCounter.labels(req.method, req.path, res.statusCode).inc();
        originalEnd.call(res, chunk, encoding)
    }
    next();
});

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

// Endpoint for Prometheus to scrape metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', prometheus.register.contentType);
    res.send(await prometheus.register.metrics());
});

app.get('/test', (req, res) => {
    throw Error()
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