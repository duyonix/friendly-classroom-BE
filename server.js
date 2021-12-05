require('dotenv').config();

const express = require('express');
const cors = require('cors');
const route = require('./routes');
const db = require('./config/db');



// connect to database mongodb
db.connect()

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

route(app);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server listen on ${PORT}`);
});

// $env:GOOGLE_APPLICATION_CREDENTIALS="C:/Users/DELL/Downloads/friendlyclassroombe-firebase-adminsdk-iawwe-31df08dce9.json"