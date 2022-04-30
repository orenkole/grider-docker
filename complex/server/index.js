const keys = require('./keys');

  // ================= //
 // Express app setup //
// ================= //
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
/**
 * Make request from domain of react running on
 * to domain where express is hosted on
 */
app.use(cors());
/**
 * Parse request body and turn it to json
 */
app.use(bodyParser.json());


  // ====================== //
 // Postgress client setup //
// ====================== //
const {Pool} = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})

/**
 * We MUST create at least 1 table
 * number - name of column. Ceep indexes of fibonnaci elements shown
 */
pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});


  // ================== //
 // Redis client setup //
// ================== //

const redis = require('redis');
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
})
/**
 * If we have a client that is listening, subscribing or publishing information
 * we have to make a duplicate connection
 * because if connection is turned into connection that is going to listen, subscribe or publish information
 * it can't be used for other purpuses
 * that's why we need to make a duplicate
 */
const redisPublisher = redisClient.duplicate();


  // ======================= //
 // Express routes handlers //
// ======================= //

app.get('/', (req, res) => {
  res.send("Hi");
})

app.get('/values/all', async (req, res) => {
  const values = await pgClient.query(
    'SELECT * from values'
  );

  res.send(values.rows);
})

app.get('/values/current', async (req, res) => {
  redisClient.hgetall('values', (err, values) => {
    res.send(values)
  })
})

app.post('/values', async (req, res) => {
  const index = req.body.index;
  if(parseInt(index) > 40) {
    return res.status(422).send("index too hight")
  }

  /** we'll replace 'Nothing yet!' string with calculated value */
  redisClient.hset('values', index, 'Nothing yet!')
  /** sent to workder process to pull value out of redis
   * and start calculating fib value for it
   */
  redisPublisher.publish('insert', index);
  pgClient.query('INSERT INTO values(number) VALUES($1)', [index])
  res.send({working: true})
})

app.listen(5000, err => {
  console.log('Listening')
})