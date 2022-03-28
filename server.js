const express = require('express')
const bodyParser = require('body-parser')
const app = express()

require('dotenv').config();

const user =  process.env.USERDB
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


const inverter = (request, response) => {
  pool.query(`
  with records as (
  select ROW_NUMBER () OVER (ORDER BY createdat) AS ORDEM, 
  to_char(createdat, 'DD Mon YYYY') as dia, to_char(createdat, 'HH12:MI:SS') as hora,
  dados->'values'->'eactotal' AS eactotal,
  dados->'values'->'ppv1' AS ppv1,
  dados->'inverter' AS inverter,
  createdat
  from leituras 
   order by createdat desc
  )
  select distinct(inverter::text)
  from records`, (error, results) => {
    if (error) {
      throw error
    }
    response.status(200).json(results.rows)
  })
}

const leituraUm = (request, response) => {
    let inverter = request.params['inverter'] 
    console.log(inverter)
    pool.query(`with records as (
      select ROW_NUMBER () OVER (ORDER BY createdat) AS ORDEM, 
      to_char(createdat, 'DD Mon YYYY') as dia, to_char(createdat, 'HH12:MI:SS') as hora,
      dados->'values'->'eactotal' AS eactotal,
      dados->'values'->'ppv1' AS ppv1,
      dados->'inverter' AS inverter,
      createdat
      from leituras where dados->>'inverter' like '`+inverter+`'
       order by createdat desc
      )
      
      select recorda.*, b.ordem as bordem, b.createdat as createdat, (b.createdat-recorda.createdat) as delay 
      from records recorda inner join records b on recorda.ordem = b.ordem-1 `, (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const escrita = (request, response) => {
    const dados  = request.body
    pool.query('INSERT INTO leituras (dados) VALUES ($1)', [dados], (error, results) => {
    if (error) {
        throw error
    }
    response.status(201).send(results)
    })
}

app.post('/escrita', escrita)
app.get('/leitura/:inverter', leituraUm)
app.get('/leitura', leitura)
app.get('/inverter', inverter)
