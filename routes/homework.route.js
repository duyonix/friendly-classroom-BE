const router = require('express').Router();

const homeworkController = require('../controllers/HomeworkController');

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

router.post('/createHomework', upload.single('file'), homeworkController.createHomework)
router.post('/removeHomework', homeworkController.removeHomework)
router.post('/getAllHomeworkMetadataOfClass', homeworkController.getAllHomeworkMetadataOfClass)
router.post('/getHomeworkDetail', homeworkController.getHomeworkDetail)
router.post('/changeHomeworkDeadline', homeworkController.editHomeworkDeadline)

module.exports = router