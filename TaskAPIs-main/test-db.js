// test-db.js — run once to prove MySQL works:  npm run test:db
require('dotenv').config();
const pool = require('./src/db');

async function test() {
  try {
    const [rows] = await pool.query(
      'SELECT 1 AS ok, DATABASE() AS db, NOW() AS now'
    );
    console.log('Connected to MySQL');
    console.log(rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Connection failed');
    console.error(err.code || '', err.message);
    if (!process.env.DB_USER || process.env.DB_USER === 'your_aiven_username') {
      console.error('Missing .env credentials. Copy .env.example to .env first.');
    }
    process.exit(1);
  }
}

test();
