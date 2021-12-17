const Submission = require('../models/Submission');
const firebase = require('../firebase');

const UserController = require('./UserController');

class SubmissionController {
    submitSubmission = (req, res) => {
        try {
            const studentId = req.userId;
            const homeworkId = req.body.homeworkId;
            const file = req.file;

            if (!file) {
                throw new Error('Not submission');
            }

            // newFilename = {studentId}.{extension of file}
            const newFilename = `${studentId}.${file.filename.split('.')[1]}`;
            var optionsFirebase = {
                destination: `submission/${homeworkId}/${newFilename}`,
            };

            firebase.bucket.upload(file.path, optionsFirebase, async function (err, item) {
                const status = 'DONE';
                const attachedFiles = [newFilename];
                await Submission.updateOne(
                    { homeworkId: homeworkId, studentId: studentId },
                    { $set: { attachedFiles: attachedFiles, status: 'DONE' } }
                );
                return res.status(200).json({ success: true, message: 'Nộp thành công' });
            });
        } catch (err) {
            if (err.message == 'Not submission') {
                return res.status(400).json({ success: false, message: 'File bài làm của bạn đâu :(' });
            }
        }
    };

    getSubmission = async (req, res) => {
        try {
            const userId = req.userId; // user who want to see submission
            const classroomId = req.body.classroomId;
            const homeworkId = req.body.homeworkId;
            const studentId = req.body.studentId; // the owner of submission user want to see

            // only teacher and that student can see his submission
            if (userId != studentId) {
                const isOK = await UserController.isUserATeacherOfClass(userId, classroomId);
                if (!isOK) {
                    throw new Error('Rights');
                }
            }

            // Maybe we dont need this because every student will have default submission
            const submission = await Submission.findOne({ homeworkId: homeworkId, studentId: studentId });
            if (!submission) {
                throw new Error('Not submit');
            }

            const destinationFirebase = `submission/${homeworkId}/${submission.attachedFiles[0]}`;
            const config = {
                action: 'read',
                expires: '08-08-2025',
            };
            firebase.bucket.file(destinationFirebase).getSignedUrl(config, function (err, url) {
                try {
                    if (err) {
                        throw new Error('ERROR');
                    }
                } catch (err) {
                    return res.status(400).json({ success: false, message: 'ERROR' });
                }

                return res.status(200).json({ success: true, submission, downloadURL: url });
            });
        } catch (err) {
            if (err.message == 'Rights') {
                return res.status(400).json({ success: false, message: 'You dont have rights to see this submissions' });
            } else if (err.message == 'Not submit') {
                return res.status(400).json({ success: false, message: 'User doesnt submit' });
            }
        }
    };

    addCommentAndScore = async (req, res) => {
        try {
            const score = req.body.score;
            const comment = req.body.comment;
            const studentId = req.body.studentId;
            const homeworkId = req.body.homeworkId;

            await Submission.findOneAndUpdate({ homeworkId: homeworkId, studentId: studentId }, { $set: { score: score, comment: comment } });
            return res.status(200).json({ success: true, message: 'Đã thêm comment và điểm' });
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, message: 'Lỗi rồi :(' });
        }
    };

    getAllSubmissionMetadataOfHomework = async (req, res) => {
        const homeworkId = req.body.homeworkId;
        const result = await Submission.find({ homeworkId: homeworkId }, 'studentId status score').populate({
            path: 'studentId',
            select: 'fullName username',
        });
        return res.status(200).json(result);
    };
}

module.exports = new SubmissionController();
