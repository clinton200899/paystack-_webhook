const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.post('/', (req, res) => {
  const event = req.body;

  if (event && event.event === 'charge.success') {
    const ref = event.data.reference;

    conn.query('SELECT * FROM orders WHERE payment_ref = ?', [ref], (err, results) => {
      if (err) return res.status(500).send('DB error');

      if (results.length > 0 && results[0].status !== 'Paid') {
        conn.query('UPDATE orders SET status = ? WHERE payment_ref = ?', ['Paid', ref], (err2) => {
          if (err2) return res.status(500).send('Update error');
          return res.status(200).send('Order updated');
        });
      } else {
        return res.status(200).send('Order already updated or not found');
      }
    });
  } else {
    res.status(400).send('Invalid webhook event');
  }
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});
