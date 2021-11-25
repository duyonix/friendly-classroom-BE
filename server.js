require('dotenv').config()

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

const authorizeRoutes = require('route/authorize.route.js');

app.use(express.json());

app.use('/api/authorize', authorizeRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listen on ${PORT}`);
});