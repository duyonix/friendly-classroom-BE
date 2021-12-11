const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Classroom = require('../models/Classroom');

class ClassroomController {
    // @route GET api/posts
    // @desc Get posts
    // @access Private
    get = async(req, res) => {
        try {
            const classroom = await Classroom.findById(req.params.classroomId);
            res.json({ success: true, classroom });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };

    // @route POST api/posts
    // @desc Create post
    // @access Private
    create = async(req, res) => {
        const { name, description } = req.body;
        if (!name || !description)
            return res
                .status(400)
                .json({ success: false, message: 'Please add all the fields' });

        try {
            let code = Math.random().toString(36).substring(2, 8);
            // check code unique
            while (await Classroom.findOne({ code: code })) {
                code = Math.random().toString(36).substring(2, 8);
            }
            var numberOfMember = 1 // MB them vo
            const newClassroom = new Classroom({
                name,
                code,
                description,
                teacherId: req.userId,
                numberOfMember
            });
            const result = await newClassroom.save();
            res.json({
                success: true,
                message: 'Create new classroom successfully',
                classroom: newClassroom,
                userId: req.userId,
            });

            // Add classroom id to classTeacher
            await User.findOneAndUpdate({ _id: req.userId }, { $push: { classTeacher: result._id } })


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
    update = async(req, res) => {
        const { name, description } = req.body;

        try {
            const classroomUpdateCondition = {
                _id: req.params.classroomId,
                teacherId: req.userId,
            };

            let updatedClassroom = await Classroom.findOneAndUpdate(
                classroomUpdateCondition, {
                    name,
                    description,
                }, { new: true }
            );

            // User not authorized to update classroom or classroom not found
            if (!updatedClassroom)
                return res.status(401).json({
                    success: false,
                    message: 'Classroom not found or user not authorized',
                });

            res.json({
                success: true,
                message: 'Update classroom successfully',
                classroom: updatedClassroom,
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
    delete = async(req, res) => {
        try {
            const classroomDeleteCondition = {
                _id: req.params.classroomId,
                teacherId: req.userId,
            };
            //  delete all comment & post have classroomId
            Comment.deleteMany({ classroomId: req.params.classroomId });
            Post.deleteMany({ classroomId: req.params.classroomId });

            const deleteClassroom = await Classroom.findOneAndDelete(
                classroomDeleteCondition
            );

            if (!deleteClassroom)
                return res.status(401).json({
                    success: false,
                    message: 'Classroom not found or user not authorized',
                });

            res.json({ success: true, classroom: deleteClassroom });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };

    join = async(req, res) => {
        const { code } = req.body;

        try {
            const classroomUpdateCondition = {
                code: code,
            };

            // khác teacherId

            let updatedClassroom = await Classroom.findOne({ code: code });
            if (!updatedClassroom ||
                updatedClassroom.teacherId == req.userId ||
                updatedClassroom.listStudent.includes(req.userId)
            )
                return res.status(401).json({
                    success: false,
                    message: 'Classroom not found or user already in class',
                });

            updatedClassroom.listStudent.push(req.userId);
            updatedClassroom.numberOfMember = updatedClassroom.numberOfMember + 1
            await updatedClassroom.save();

            // TODO: cập nhật danh sách classroom cũa user
            let updatedMember = await User.findOne({ _id: req.userId })
            updatedMember.classStudent.push(updatedClassroom._id)
            await updatedMember.save()

            // User not authorized to update classroom or classroom not found
            if (!updatedClassroom)
                return res.status(401).json({
                    success: false,
                    message: 'Classroom not found or user not authorized',
                });

            // cập nhật list classroom for user

            res.json({
                success: true,
                message: 'join classroom successfully',
                classroom: updatedClassroom,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    removeStudent = async(req, res) => {
        const { studentId } = req.body;
        console.log(studentId);
        try {
            const classroomUpdateCondition = {
                _id: req.params.classroomId,
                teacherId: req.userId,
            };

            let updatedClassroom = await Classroom.findOne(
                classroomUpdateCondition
            );

            // User not authorized to update classroom or classroom not found
            if (!updatedClassroom)
                return res.status(401).json({
                    success: false,
                    message: 'Classroom not found or user not authorized',
                });
            updatedClassroom.listStudent.pull({ _id: studentId });

            updatedClassroom.numberOfMember = updatedClassroom.numberOfMember - 1
            await updatedClassroom.save();

            // TODO: cập nhật danh sách classroom cũa user
            let updatedMember = await User.findOne({ _id: studentId })
            updatedMember.classStudent.pull()

            res.json({
                success: true,
                message: 'Remove student from classroom successfully',
                classroom: updatedClassroom,
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
    people = async(req, res) => {
        try {
            const classroom = await Classroom.findById(req.params.classroomId)
                .select('teacherId listStudent')
                .populate('teacherId listStudent');

            res.json({ success: true, classroom });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
            });
        }
    };
}

module.exports = new ClassroomController();