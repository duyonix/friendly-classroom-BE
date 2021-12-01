/* const { Router } = require('express')*/
const jwt = require('jsonwebtoken')

const User = require('../config/user.model')
const argon2 = require('argon2')

const generateToken = payload => {
    const { id, username } = payload;
    console.log(id)
    console.log(username)
    const accessToken = jwt.sign({ id, username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '1h'
    })
    const refreshToken = jwt.sign({ id, username }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1h'
    })
    return { accessToken, refreshToken };
}

exports.signup = async(req, res) => {
    const username = req.body.username
    var password = req.body.password
    const gmail = req.body.gmail
    const sex = req.body.sex
    try {
        // await newUser.save()
        // res.json('User is added')
        const user = await User.findOne({ username })
        if (user) {
            return res.status(400).json({ success: false, message: "Username already taken" })
        }
        password = await argon2.hash(password)
        console.log(password)
        const newUser = new User({ username, password, gmail, sex })
        await newUser.save()
        res.json('User is added')
    } catch (err) {
        res.status(400).json('Failed')
        console.log(err)
    }
}

exports.login = async(req, res) => {
    const username = req.body.username
    const password = req.body.password
    const user = await User.find({ username })
    console.log(user)
    if (!user) {
        return res.sendStatus(401)
    }
    try {
        console.log(user[0].password)
        console.log(password)
        const passwordValid = await argon2.verify(user[0].password, password)

        if (!passwordValid) {
            return res.status(400).json({ message: "False password" })
        }
        const tokens = generateToken(user[0]);
        // console.log(user)
        await User.updateOne({ username: username }, { $set: { refreshToken: tokens.refreshToken } })
        return res.status(200).json(tokens)
    } catch (err) {
        res.status(400).json("Failed")
        console.log(err)
    }


    /*if (password != user.password) {
        return res.status(400).json({ message: "False password" })
    }*/

}

exports.refreshToken = async(req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    const user = User.find({ refreshToken: refreshToken })
    if (!user) {
        return res.sendStatus(403);
    }
    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const tokens = generateToken(user);
        await User.updateOne({ username: user.username }, { $set: { refreshToken: tokens.refreshToken } })
        res.status(200)
        res.json(tokens)
    } catch (error) {
        res.sendStatus(403);
    }
}

exports.logout = async(req, res) => {
    console.log(req.userId)
    await User.updateOne({ _id: req.userId }, { $set: { refreshToken: null } })
    res.status(200).json({ "Message": "Success" })
}