const router = require('express').Router();
const authorizeController = require('../controllers/authorizeController');
const auth = require('../middleware/auth');

router.route('/signup').post(authorizeController.signup);
router.route('/login').post(authorizeController.login);

module.exports = router;