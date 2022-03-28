const express = require('express')
const bodyParser = require('body-parser')
const app = express()

require('dotenv').config();

const user =  process.env.USER
const host =  process.env.HOST
const database = process.env.DATABASE
const password =   process.env.PASSWORD
const portserver = process.env.PORTSERVER || 80
const portdb = process.env.PORTDB || 5432

const Pool = require('pg').Pool
const pool = new Pool({
  user: user,
  host: host,
  database: database,
  password: password,
  port: portdb,
})


app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
  })

app.listen(portserver, () => {
console.log(`App running on port ${portserver}.`)
})

const leitura = (request, response) => {
    pool.query('SELECT * FROM leituras ', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

const escrita = (request, response) => {
    const dados  = request.body
    console.log(dados)

    pool.query('INSERT INTO leituras (dados) VALUES ($1)', [dados], (error, results) => {
    if (error) {
        throw error
    }
    response.status(201).send(results)
    })
}

app.post('/escrita', escrita)
app.get('/leitura', leitura)
