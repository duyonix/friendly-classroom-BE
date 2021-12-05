const router = require('express').Router({ mergeParams: true });
const postController = require('../controllers/PostController');

router.get('/all', postController.get);
router.post('/', postController.create);
// router.get('/:id', postController.detail);
router.put('/:postId', postController.update);
router.delete('/:postId', postController.delete);

module.exports = router;
