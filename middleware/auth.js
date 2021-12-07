const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log('Jump in');
    const token = req.header('Authorization');

    if (!token) {
        return res.sendStatus(401);
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decoded.id;
        req.username = decoded.username;
        next();
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
};

module.exports = verifyToken;