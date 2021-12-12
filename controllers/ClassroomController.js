const mongoose = require('mongoose');
const Post = require('../models/Post');
const User = require('../models/User');
const Classroom = require('../models/Classroom');

class ClassroomController {
    get = async (req, res) => {
        try {
            const classroom = await Classroom.findById(req.params.classroomId);
            res.json({ success: true, classroom });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi rồi :(',
            });
        }
    };

    create = async (req, res) => {
        const { name, description } = req.body;

        try {
            // check if user is already teacher of another classroom which has the same name

            let checkDuplicateNameClassroom = await Classroom.findOne({
                name,
                teacherId: req.userId,
            });

            if (checkDuplicateNameClassroom) {
                throw new Error('Tên lớp học bị trùng');
            }

            let code = Math.random().toString(36).substring(2, 8);
            // check code unique
            while (await Classroom.findOne({ code: code })) {
                code = Math.random().toString(36).substring(2, 8);
            }

            var numberOfMember = 1;
            const newClassroom = new Classroom({
                name,
                code,
                description,
                teacherId: req.userId,
                numberOfMember,
            });
            const result = await newClassroom.save();
            res.json({
                success: true,
                message: 'Tạo lớp học thành công',
                classroom: newClassroom,
            });

            // Add classroom id to classTeacher
            await User.findOneAndUpdate(
                { _id: req.userId },
                { $push: { classTeacher: result._id } }
            );
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
    // @route PUT api/posts
    // @desc Update post
    // @access Private
    update = async (req, res) => {
        const { name, description } = req.body;

        try {
            if (name) {
                // check if user is already teacher of another classroom which has the same name

                let checkDuplicateNameClassroom = await Classroom.findOne({
                    name,
                    teacherId: req.userId,
                });

                if (checkDuplicateNameClassroom) {
                    throw new Error('Tên lớp học bị trùng');
                }
            }

            const classroomUpdateCondition = {
                _id: req.params.classroomId,
                teacherId: req.userId,
            };

            let updatedClassroom = await Classroom.findOneAndUpdate(
                classroomUpdateCondition,
                {
                    name,
                    description,
                },
                { new: true }
            );

            // User not authorized to update classroom or classroom not found
            if (!updatedClassroom) {
                throw new Error(
                    'Bạn không có quyền chỉnh sửa thông tin lớp này'
                );
            }

            res.json({
                success: true,
                message: 'Cập nhật thông tin lớp thành công',
                classroom: updatedClassroom,
            });
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

    delete = async (req, res) => {
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

            if (!deleteClassroom) {
                throw new Error('Bạn không có quyền xóa lớp này');
            }

            res.json({
                success: true,
                message: 'Xóa lớp thành công',
                classroom: deleteClassroom,
            });
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

    join = async (req, res) => {
        const { code } = req.body;

        try {
            let updatedClassroom = await Classroom.findOne({ code: code });

            if (!updatedClassroom) {
                throw new Error('Không tìm thấy lớp này');
            }

            if (
                updatedClassroom.teacherId == req.userId ||
                updatedClassroom.listStudent.includes(req.userId)
            ) {
                throw new Error('Người dùng đã tham gia lớp này');
            }

            updatedClassroom.listStudent.push(req.userId);
            updatedClassroom.numberOfMember += 1;
            await updatedClassroom.save();

            // TODO: cập nhật danh sách classroom cũa user
            let updatedMember = await User.findOne({ _id: req.userId });
            updatedMember.classStudent.push(updatedClassroom._id);
            await updatedMember.save();

            res.json({
                success: true,
                message: 'Tham gia lớp học thành công',
                classroom: updatedClassroom,
            });
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
    removeStudent = async (req, res) => {
        const { studentId } = req.body;

        try {
            const classroomUpdateCondition = {
                _id: req.params.classroomId,
                teacherId: req.userId,
            };

            let updatedClassroom = await Classroom.findOne(
                classroomUpdateCondition
            );

            if (!updatedClassroom) {
                throw new Error('Bạn không có quyền xóa học sinh');
            }
            updatedClassroom.listStudent.pull({ _id: studentId });

            updatedClassroom.numberOfMember -= 1;
            await updatedClassroom.save();

            // TODO: cập nhật danh sách classroom cũa user
            let updatedMember = await User.findOne({ _id: studentId });
            updatedMember.classStudent.pull({ _id: studentId });

            await updatedMember.save();
            res.json({
                success: true,
                message: 'Xóa học sinh thành công',
                classroom: updatedClassroom,
            });
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
    people = async (req, res) => {
        try {
            const classroom = await Classroom.findById(req.params.classroomId)
                .select('teacherId listStudent')
                .populate('teacherId listStudent');

            res.json({ success: true, classroom });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                success: false,
                message: 'Lỗi rồi :(',
            });
        }
    };
}

module.exports = new ClassroomController();
