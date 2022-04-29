const keys = require('./keys');

// Express app setup
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

// Postgress client setup
const {Pool} = require('pg');
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort
})
pgClient.on('error', () => console.log("Lost PG connection"))

/**
 * We MUST create at least 1 table
 * number - name of column. Ceep indexes of fibonnaci elements shown
 */
pgClient.query('CREATE TABLE IF NOT EXIST values (number INT)')
  .catch((err) => console.log(err))