const router = require('express').Router();
const postController = require('../controllers/PostController');

router.get('/', postController.get);
router.post('/', postController.create);
router.get('/:id', postController.detail);
router.put('/:id', postController.update);
router.delete('/:id', postController.delete);

module.exports = router;
