const dotenv = require('dotenv')
dotenv.config()

var MongoClient = require('mongodb').MongoClient
    // var uri = process.env.DATABASE_URL
var uri = "mongodb://FriendlyClassroom:HCMUS@cluster0-shard-00-00.nkw1u.mongodb.net:27017,cluster0-shard-00-01.nkw1u.mongodb.net:27017,cluster0-shard-00-02.nkw1u.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-1af7t0-shard-0&authSource=admin&retryWrites=true&w=majority"
console.log(uri)
MongoClient.connect(uri, function(err, client) {
    if (!err) console.log("Connected")
    const collection = client.db('FriendlyClassroom').collection('User')
    client.close()
})