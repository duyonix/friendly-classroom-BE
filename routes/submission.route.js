const router = require('express').Router();

const submissionController = require('../controllers/SubmissionController');
const auth = require('../middleware/auth')

const multer = require('multer');
var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }
})
const upload = multer({
    storage: storage,
});

router.post('/submitSubmission', auth, upload.single('file'), submissionController.submitSubmission)
router.post('/getSubmission', auth, submissionController.getSubmission)
router.post('/addCommentAndScore', auth, submissionController.addCommentAndScore)
router.post('/getAllSubmissionMetadataOfHomework', auth, submissionController.getAllSubmissionMetadataOfHomework)

module.exports = router