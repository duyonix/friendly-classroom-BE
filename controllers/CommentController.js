const requireLogin = require('../middleware/auth');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Comment = require('../models/Comment');

class CommentController {
    // @route POST api/posts
    // @desc Create post
    // @access Private
    create = async (req, res) => {
        const { body } = req.body;
        if (!body)
            return res
                .status(400)
                .json({ success: false, message: 'Please add all the fields' });

        try {
            const newComment = new Comment({
                classroomId: req.params.classroomId,
                postId: req.params.postId,
                body,
                commentedBy: req.userId,
            });

            await newComment.save();
            let updatedPost = await Post.findOneAndUpdate(
                {
                    _id: req.params.postId,
                },
                { $push: { listComment: newComment } },
                { new: true }
            );
            res.json({
                success: true,
                message: 'Create new comment successfully',
                comment: newComment,
                post: updatedPost,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    // @route PUT api/posts
    // @desc Update post
    // @access Private
    update = async (req, res) => {
        const { body } = req.body;

        // Simple validation
        if (!body)
            return res
                .status(400)
                .json({ success: false, message: 'Body is required' });

        try {
            const commentUpdateCondition = {
                _id: req.params.commentId,
                commentedBy: req.userId,
            };

            let updatedComment = await Comment.findOneAndUpdate(
                commentUpdateCondition,
                {
                    body,
                },
                { new: true }
            );

            // User not authorized to update post or post not found
            if (!updatedComment)
                return res.status(401).json({
                    success: false,
                    message: 'Comment not found or user not authorized',
                });

            res.json({
                success: true,
                message: 'Update comment successfully',
                comment: updatedComment,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };

    // @route DELETE api/posts
    // @desc Delete post
    // @access Private
    delete = async (req, res) => {
        try {
            const commentDeleteCondition = {
                _id: req.params.commentId,
                commentedBy: req.userId,
            };

            let updatedPost = await Post.findById(req.params.postId);
            updatedPost.listComment.pull(req.params.commentId);
            await updatedPost.save();

            const deleteComment = await Comment.findOneAndDelete(
                commentDeleteCondition
            );

            if (!deleteComment)
                return res.status(401).json({
                    success: false,
                    message: 'Comment not found or user not authorized',
                });

            res.json({
                success: true,
                comment: deleteComment,
                post: updatedPost,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
}

module.exports = new CommentController();
