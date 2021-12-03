const router = require('express').Router();
const classroomController = require('../controllers/ClassroomController');

router.get('/:classroomId', classroomController.get);
router.post('/', classroomController.create);
router.put('/:classroomId', classroomController.update);
router.delete('/:classroomId', classroomController.delete);

module.exports = router;
