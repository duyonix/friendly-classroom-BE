const router = require('express').Router();
const authorizeController = require('../controllers/authorizeController');
const auth = require('../middleware/auth');

router.route('/signup').post(authorizeController.signup);
router.route('/login').post(authorizeController.login);
router.route('/refreshToken').post(authorizeController.refreshToken);
router.route('/logout').delete(auth, authorizeController.logout);

module.exports = router;
