const router = require('express').Router()

const documentController = require('../controllers/DocumentController')
const auth = require('../middleware/auth');

const multer = require('multer')


var storage = multer.diskStorage({
    destination: './uploads/',
    filename: function(req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage })

// router.post('/upload', auth, upload.single('file'), documentController.upload)
// for testing reason
router.post('/upload', upload.single('file'), documentController.upload)
router.post('/download', upload.single('file'),documentController.download)

module.exports = router