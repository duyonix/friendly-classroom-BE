const dotenv = require('dotenv')
const mongoose = require('mongoose')
dotenv.config()

var uri = process.env.DATABASE_URL
mongoose.connect(uri, {
    useNewUrlParser: true
})
const connection = mongoose.connection
connection.once('open', () => {
    console.log("MongoDB database connection established successsfully")
})