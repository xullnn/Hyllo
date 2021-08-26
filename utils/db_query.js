require('dotenv').config();
const { Pool } = require('pg');
const pgPool = new Pool({
  host: process.env.dev_host,
  port: process.env.dev_port,
  connectionString: process.env.dev_db_string
});

module.exports = {
  query: async (sql, params) => { // returns promise
    try {
      var client = await pgPool.connect(); // acquire a client from pool
      var result = await client.query(sql, params);
    } catch (e) {
      console.log(e.stack)
    } finally {
      await client.release();
      return result;
    }
  }
}
