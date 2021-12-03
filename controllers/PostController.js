const requireLogin = require('../middleware/auth');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');

class PostController {
  // @route GET api/posts
  // @desc Get posts
  // @access Private
  get = async (req, res) => {
    try {
      const posts = await Post.find({ classroomId: req.params.classroomId });
      res.json({ success: true, posts });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  };

  // @route POST api/posts
  // @desc Create post
  // @access Private
  create = async (req, res) => {
    const { title, body } = req.body;
    if (!title || !body)
      return res
        .status(400)
        .json({ success: false, message: 'Please add all the fields' });

    try {
      let user = await User.findOne({ _id: req.userId }).select('-password');

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
  // @route PUT api/posts
  // @desc Update post
  // @access Private
  update = async (req, res) => {
    const { title, description, url, status } = req.body;

    // Simple validation
    if (!title)
      return res
        .status(400)
        .json({ success: false, message: 'Title is required' });

    try {
      let updatedPost = {
        title,
        description: description || '',
        url: (url.startsWith('https://') ? url : `https://${url}`) || '',
        status: status || 'TO LEARN',
      };

      const postUpdateCondition = { _id: req.params.id, user: req.userId };

      updatedPost = await Post.findOneAndUpdate(
        postUpdateCondition,
        updatedPost,
        { new: true }
      );

      // User not authorised to update post or post not found
      if (!updatedPost)
        return res.status(401).json({
          success: false,
          message: 'Post not found or user not authorised',
        });

      res.json({
        success: true,
        message: 'Excellent progress!',
        post: updatedPost,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: 'Internal server error' });
    }
  };

  // @route DELETE api/posts
  // @desc Delete post
  // @access Private
  delete = async (req, res) => {
    try {
      const postDeleteCondition = {
        _id: req.params.id,
        postedBy: req.userId,
      };
      // TODO: delete all comment have postId
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
