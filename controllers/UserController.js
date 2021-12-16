const User = require('../models/User');
const firebase = require('../firebase');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema.Types;

const Homework = require('../models/Homework');

getSignedUrlAvatar = async (filename) => {
    const destinationFirebase = `avatar/${filename}`;
    const config = {
        action: 'read',
        expires: '03-17-2025',
    };
    const url = await firebase.bucket.file(destinationFirebase).getSignedUrl(config);
    return url;
};

class UserController {
    getInformation = (req, res) => {
        try {
            const userId = req.userId;
            const username = req.username;
            User.findOne({ username: username })
                .populate({
                    path: 'classStudent classTeacher',
                    select: 'name code description teacherId numberOfMember',
                    populate: {
                        path: 'teacherId',
                        select: 'fullName avatarUrl',
                    },
                })
                .exec(async function (err, user) {
                    try {
                        if (err) {
                            throw new Error('ERROR');
                        }
                    } catch (err) {
                        return res.status(400).json({ success: false, message: 'Lỗi rồi :(' });
                    }
                    return res.status(200).json({ success: true, user });
                });
        } catch (err) {
            console.log(err);
        }
    };
    changeAvatar = (req, res) => {
        try {
            const username = req.username;
            const userId = req.userId;
            const avatar = req.file;
            const ext = avatar.filename.split('.')[1];
            const filename = `${userId}.${ext}`;
            const filePath = `avatar/${filename}`;
            var options = {
                destination: filePath,
            };
            firebase.bucket.upload(avatar.path, options, async (err, item) => {
                try {
                    if (err) {
                        console.log(err);
                        throw new Error('ERROR');
                    }
                } catch (err) {
                    return res.status(400).json({ success: false, message: 'Lỗi rồi :<' });
                }
                const signedUrl = await getSignedUrlAvatar(filename);
                await User.updateOne({ username: username }, { $set: { avatarUrl: signedUrl[0] } });
                return res.status(200).json({ success: true, message: 'Thay đổi avatar thành công !!!' });
            });
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, message: 'Lỗi rồi :<' });
        }
    };
    isUserATeacherOfClass = async (userId, classId) => {
        const user = await User.find({
            _id: userId,
            classTeacher: { $in: [classId] },
        });
        /*var isOK = false
            user.classTeacher.forEach(element => {
                if (element.toString() === classId) {
                    isOK = true
                    return
                }
            });*/
        console.log(user);
        if (user.length > 0) return true;
        else return false;
    };
    isUserAStudentOfClass = async (userId, classId) => {
        const user = await User.findOne({ _id: userId }, 'classStudent');
        var isOK = false;
        user.classStudent.forEach((element) => {
            // console.log(element.toString())
            // console.log(classId)
            if (element.toString() === classId) {
                isOK = true;
                return;
            }
        });
        return isOK;
    };
    isUserAMemberOfClass = async (userId, classId) => {
        const user = await User.findOne({ _id: userId }, 'classStudent classTeacher');
        if (classId in user.classStudent || classId in user.classTeacher) {
            return true;
        }
        return false;
    };

    // ydam
    todo = async (req, res) => {
        return res.status(200).json({ success: true, message: 'đây là todo' });
    };
    calendar = async (req, res) => {
        return res.status(200).json({ success: true, message: 'đây là calendar' });
    };
}

module.exports = new UserController();
