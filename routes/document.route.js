const router = require('express').Router()

const documentController = require('../controllers/DocumentController')

const multer = require('multer')
const upload = multer({ dest: 'uploads/' })

router.post('/upload', upload.single('file'), documentController.upload)
router.get('/download', documentController.download)

module.exports = router