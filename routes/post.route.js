const router = require('express').Router();
const postController = require('../controllers/PostController');

router.post('/create', postController.create);
router.delete('/delete', postController.delete);

module.exports = router;
