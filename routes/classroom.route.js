const router = require('express').Router({ mergeParams: true });
const classroomController = require('../controllers/ClassroomController');

router.get('/people', classroomController.people);
router.get('/', classroomController.get);
router.put('/removeStudent', classroomController.removeStudent);
router.put('/', classroomController.update);
router.delete('/', classroomController.delete);

module.exports = router;
