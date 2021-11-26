const router = require('express-promise-router')();
const authorizeController = require('../controller/authorize.controller');

router.get('/login', authorizeController.seeAllUsers);
router.post('/signup', authorizeController.signup);

module.exports = router;