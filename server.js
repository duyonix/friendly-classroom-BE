require('dotenv').config()

const express = require('express');
const cors = require('cors');
const auth = require('./middleware/auth')
    // const jwt = require('jsonwebtoken');
const mongoose = require('mongoose')

const app = express();

const authorizeRoutes = require('./route/authorize.route.js');
const userRoute = require('./route/user.route')
const testRoute = require('./route/test.route')

app.use(express.json());
app.use(cors())

app.use('/api/authorize', authorizeRoutes)
app.use('/api/user', userRoute)
app.use('/api/getSomeInformation', auth, testRoute)

mongoose.connect(process.env.DATABASE_URL)

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listen on ${PORT}`);
});