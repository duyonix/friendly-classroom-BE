/* const { Router } = require('express')*/
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const argon2 = require('argon2');

const generateToken = (payload) => {
    const { id, username } = payload;
    const accessToken = jwt.sign({ id, username },
        process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1h',
        }
    );
    const refreshToken = jwt.sign({ id, username },
        process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1h',
        }
    );
    return { accessToken, refreshToken };
};

class AuthorizeController {
    signup = async(req, res) => {
        const username = req.body.username;
        var password = req.body.password;
        const gmail = req.body.gmail;
        const fullname = req.body.fullname;
        const phoneNumber = req.body.phoneNumber
        try {
            const user = await User.findOne({ username });
            if (user) {
                return res
                    .status(400)
                    .json({ success: false, message: 'Username already taken' });
            }
            password = await argon2.hash(password);
            const newUser = new User({ username, password, gmail, fullname, phoneNumber });
            await newUser.save();
            res.status(200).json({ success: true, message: 'User is added' });
        } catch (err) {
            res.status(400).json({ success: false, message: 'ERROR' });
        }
    };

    login = async(req, res) => {
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({ 'username': username }, 'username password', async function(err, user) {
            if (err) {
                console.log(err)
                return res.status(400).json({ success: false, message: "Username doesn't exists" })
            }
            const passwordValid = await argon2.verify(user.password, password)
            if (!passwordValid) {
                return res.status(400).json({ success: false, message: 'Password incorrect' })
            }
            const tokens = generateToken(user)
            await User.updateOne({ username: username }, { $set: { refreshToken: tokens.refreshToken } });
            return res.status(200).json(tokens);

        })
    };

    refreshToken = async(req, res) => {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.sendStatus(401);
        }
        const user = User.find({ refreshToken: refreshToken });
        if (!user) {
            return res.sendStatus(403);
        }
        try {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const tokens = generateToken(user);
            await User.updateOne({ username: user.username }, { $set: { refreshToken: tokens.refreshToken } });
            res.status(200);
            res.json(tokens);
        } catch (error) {
            res.sendStatus(403);
        }
    };

    logout = async(req, res) => {
        await User.updateOne({ _id: req.userId }, { $set: { refreshToken: null } });
        res.status(200).json({ message: 'Success' });
    };
}

module.exports = new AuthorizeController();