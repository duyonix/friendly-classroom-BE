const { Router } = require('express')
const db = require('../config/database')

exports.signup = (req, res) => {

    /*db.db.collection("User").insertOne({
        _id: 1,
        name: "Minh Bao"
    })*/
    console.log(db.db)
    console.log(db.UserCollection)

    db.UserCollection.insertOne({
        _id: 3,
        name: "Xuan Y"
    })
}


exports.seeAllUsers = async(req, res) => {
    const collection = db.UserCollection.find()
    res.status(200).send(collection);
}