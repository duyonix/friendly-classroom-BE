const router = require('express').Router()
const authServer = require('../authServer')
let User = require('../config/user.model')

router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('ERROR: ' + err))
})

router.route('/signup').post((req, res) => {
    const username = req.body.username
    const password = req.body.password
    const newUser = new User({ username, password })
    newUser.save()
        .then(() => res.json('User is added'))
        .catch(err => res.status(400).json('ERROR: ' + err))
})

router.route('/login').post(async(req, res) => {
    const username = req.body.username
    const password = req.body.password

    const users = await User.find()
    const user = users.find(user => user.username === username && user.password === password)

    if (!user) {
        return res.sendStatus(401)
    }
    res.sendStatus(200)

})

module.exports = router