const router = require('express').Router();

const userController = require('../controllers/UserController');

const multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({
    storage: storage,
});
// const authServer = require('../authServer')
// let User = require('../config/user.model')
// const authorizeController = require('../controller/authorize.controller')

/*router.route('/').get((req, res) => {
    User.find()
        .then(users => res.json(users))
        .catch(err => res.status(400).json('ERROR: ' + err))
})*/

// router.route('/signup').post()
// router.route('/login').post()

const auth = require('../middleware/auth');

// router.get('/getInformation', auth, userController.upload)
// router.post('/changeAvatar', auth, upload.single('avatar'), userController.upload)
// router.post('/changeAvatar', auth, upload.single('avatar'), userController.changeAvatar)
router.get('/getInformation', auth, userController.getInformation);
router.post('/changeAvatar', auth, upload.single('avatar'), userController.changeAvatar);
router.post('/calendar', auth, userController.calendar);
router.post('/todo', auth, userController.todo);

module.exports = router;
