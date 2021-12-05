const router = require('express').Router();
const classroomController = require('../controllers/ClassroomController');

router.get('/:classroomId', classroomController.get);
router.get('/:classroomId/people', classroomController.people);
router.post('/', classroomController.create);
router.put('/join', classroomController.join);
router.put('/:classroomId/removeStudent', classroomController.removeStudent);
router.put('/:classroomId', classroomController.update);
router.delete('/:classroomId', classroomController.delete);

module.exports = router;
