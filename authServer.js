require('dotenv').config()

const express = require('express');
const jwt = require('jsonwebtoken');
const verifyToken = require('./middleware/auth');
const app = express();

app.use(express.json());


let users = [{
        id: 1,
        username: 'henry',
        refreshToken: null
    },
    {
        id: 2,
        username: 'jim',
        refreshToken: null
    }
];

const updateRefreshToken = (username, refreshToken) => {
    console.log(refreshToken);
    users = users.map(user => {
        if (user.username === username)
            return {
                ...user,
                refreshToken
            }
        return user
    })
}

const posts = [{
        userid: 1,
        post: 'postHenry'
    },
    {
        userid: 2,
        post: 'postJim'
    },
    {
        userid: 1,
        post: 'postHenry2'
    }
]

app.get('/posts', verifyToken, (req, res) => {
    // res.json({ posts: 'my posts' });
    res.json(posts.filter(post => post.userid === req.userId));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server listen on ${PORT}`);
});

const generateToken = payload => {
    const { id, username } = payload;

    const accessToken = jwt.sign({ id, username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '25s'
    })
    const refreshToken = jwt.sign({ id, username }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1h'
    })
    return { accessToken, refreshToken };
}

app.post('/login', (req, res) => {
    const username = req.body.username;
    const user = users.find(user => user.username === username);

    // console.log(user);
    if (!user) {
        return res.sendStatus(401);
    }

    // Create JWT
    const tokens = generateToken(user);
    updateRefreshToken(username, tokens.refreshToken);
    console.log(users);
    res.json(tokens);
});

app.post('/token', (req, res) => {
    console.log('c');
    const refreshToken = req.body.refreshToken;
    console.log(refreshToken);
    console.log(req.body);
    if (!refreshToken) {
        return res.sendStatus(401);
    }
    console.log('a');
    const user = users.find(user => user.refreshToken === refreshToken);
    if (!user) {
        return res.sendStatus(403);
    }
    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        console.log('b');
        const tokens = generateToken(user);
        updateRefreshToken(user.username, tokens.refreshToken);

        res.json(tokens);
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
})

app.delete('/logout', verifyToken, (req, res) => {
    const user = users.find(user => user.id === req.userId);
    updateRefreshToken(user.username, null)
    console.log(users)
})