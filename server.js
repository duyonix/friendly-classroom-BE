require('dotenv').config();

const express = require('express');
const cors = require('cors');
const auth = require('./middlewares/auth');
// const jwt = require('jsonwebtoken');
const route = require('./routes');
const db = require('./config/db');

// Connect to DB
db.connect();

const app = express();

app.use(express.json());
app.use(cors());

// Routes init
route(app);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server listen on ${PORT}`);
});
