const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: '144.22.226.142',
  database: 'solar',
  password: 'myPassword',
  port: 5432,
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

app.listen(port, () => {
console.log(`App running on port ${port}.`)
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
