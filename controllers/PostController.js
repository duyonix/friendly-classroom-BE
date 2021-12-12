const requireLogin = require('../middleware/auth');
const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Classroom = require('../models/Classroom');
const Comment = require('../models/Comment');

class PostController {
    get = async (req, res) => {
        try {
            const classroom = await Classroom.findById(req.params.classroomId)
                .select('listPost')
                .populate('listPost')
                .populate({
                    path: 'listPost',
                    populate: [
                        { path: 'postedBy', select: 'username' },
                        {
                            path: 'listComment',
                            populate: [
                                { path: 'commentedBy', select: 'username' },
                            ],
                            options: {
                                sort: { createdAt: -1 },
                            },
                        },
                    ],
                    options: {
                        sort: { createdAt: -1 },
                    },
                });
            res.json({ success: true, posts: classroom.listPost });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi rồi :(',
            });
        }
    };
    detail = async (req, res) => {
        try {
            const post = await Post.findById(req.params.postId)
                .populate('postedBy listComment')
                .sort('-createdAt')
                .populate({
                    path: 'listComment',
                    populate: [{ path: 'commentedBy', select: 'username' }],
                    options: {
                        sort: { createdAt: -1 },
                    },
                });

            if (!post) {
                throw new Error('Không tìm thấy post');
            }
            res.json({ success: true, post: post });
        } catch (error) {
            if (error.message)
                res.status(400).json({
                    success: false,
                    message: error.message,
                });
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi rồi :(',
            });
        }
    };
    create = async (req, res) => {
        const { title, body } = req.body;
        if (!title || !body)
            return res
                .status(400)
                .json({ success: false, message: 'Please add all the fields' });

        try {
            const newPost = new Post({
                classroomId: req.params.classroomId,
                title,
                body,
                postedBy: req.userId,
            });

            await newPost.save();
            let updatedClassroom = await Classroom.findOneAndUpdate(
                {
                    _id: req.params.classroomId,
                },
                { $push: { listPost: newPost } },
                { new: true }
            );
            res.json({
                success: true,
                message: 'Create new post successfully',
                post: newPost,
                classroom: updatedClassroom,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi rồi :(',
            });
        }
    };
    update = async (req, res) => {
        const { title, body } = req.body;

        try {
            const postUpdateCondition = {
                _id: req.params.postId,
                postedBy: req.userId,
            };

            let updatedPost = await Post.findOneAndUpdate(
                postUpdateCondition,
                {
                    title,
                    body,
                },
                { new: true }
            );

            // User not authorized to update post or post not found
            if (!updatedPost)
                return res.status(401).json({
                    success: false,
                    message: 'Post not found or user not authorized',
                });

            res.json({
                success: true,
                message: 'Update post successfully',
                post: updatedPost,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi rồi :(',
            });
        }
    };

    delete = async (req, res) => {
        try {
            const postDeleteCondition = {
                _id: req.params.postId,
                postedBy: req.userId,
            };
            //  delete all comment have postId
            Comment.deleteMany({ postId: req.params.postId });

            // remove from Classroom
            let updatedClassroom = await Classroom.findById(
                req.params.classroomId
            );
            updatedClassroom.listPost.pull(req.params.postId);
            await updatedClassroom.save();

            const deletePost = await Post.findOneAndDelete(postDeleteCondition);

            if (!deletePost)
                return res.status(401).json({
                    success: false,
                    message: 'Post not found or user not authorized',
                });

            res.json({
                success: true,
                post: deletePost,
                classroom: updatedClassroom,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi rồi :(',
            });
        }
    };
}

module.exports = new PostController();
