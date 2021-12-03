const requireLogin = require('../middleware/auth');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

class PostController {
  create = async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body)
      return res
        .status(400)
        .json({ success: false, message: 'Please add all the fields' });

    try {
      let user = await User.findOne({ _id: req.userId });
      user.password = undefined;
      const newPost = new Post({
        title,
        body,
        postedBy: user,
      });

      await newPost.save();
      res.json({
        success: true,
        message: 'Create new post successfully',
        post: newPost,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  };
  delete = async (req, res) => {
    try {
      const postDeleteCondition = {
        _id: req.params.id,
        // postedBy: req.userId,
      };
      const deletePost = await Post.findOneAndDelete(postDeleteCondition);

      if (!deletePost)
        return res.status(401).json({
          success: false,
          message: 'Post not found or user not authorized',
        });

      res.json({ success: true, post: deletePost });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  };
}

module.exports = new PostController();
