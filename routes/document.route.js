const router = require('express').Router()

const documentController = require('../controllers/DocumentController')

router.post('/upload', documentController.upload)
router.get('/download', documentController.download)

module.exports = router