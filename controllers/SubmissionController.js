const Submission = require('../models/Submission')
const firebase = require('../firebase')

const UserController = require('./UserController')

class SubmissionController {
    submitSubmission = (req, res) => {
        try {
            const studentId = req.userId
            const homeworkId = req.body.homeworkId
            const file = req.file
            if (!file) {
                throw new Error("Not submission")
            }
            const newFilename = `${studentId}.${file.filename.split('.')[1]}`
            var optionsFirebase = {
                    destination: `submission/${homeworkId}/${newFilename}`
                }
                // console.log(optionsFirebase.destination)
            firebase.bucket.upload(file.path, optionsFirebase, async function(err, item) {
                const status = 'DONE'
                const attachedFiles = [newFilename]
                await Submission.updateOne({ homeworkId: homeworkId, studentId: studentId }, { $set: { attachedFiles: attachedFiles, status: 'DONE' } })
                return res.status(200).json({ success: true, message: 'Nộp thành công' })
            })
        } catch (err) {
            if (err.message == "Not submission") {
                return res.status(400).json({ success: false, message: 'File bài làm của bạn đâu :(' })
            }
        }

    }

    getSubmission = async(req, res) => {
        try {
            const userId = req.userId // user who want to see submission
            const classId = req.body.classId
            const homeworkId = req.body.homeworkId
            const studentId = req.body.studentId // the owner of submission user want to see

            // only teacher and that student can get his submission
            if (userId != studentId) {
                const isOK = await UserController.isUserATeacherOfClass(userId, classId)
                if (!isOK) {
                    throw new Error("Rights")
                }
            }

            const submission = await Submission.findOne({ homeworkId: homeworkId, studentId: studentId })
            if (!submission) {
                throw new Error("Not submit")
            }

            const destinationFirebase = `submission/${homeworkId}/${submission.attachedFiles[0]}`
            const config = {
                action: 'read',
                expires: '08-08-2025'
            };
            firebase.bucket.file(destinationFirebase).getSignedUrl(config, function(err, url) {
                try {
                    if (err) {
                        throw new Error('ERROR')
                    }
                } catch (err) {
                    return res.status(400).json({ success: false, message: 'ERROR' })
                }

                return res.status(200).json({ success: true, submission, downloadURL: url })

                const file = fs.createWriteStream("./uploads/files.pdf");
                const request = https.get(url, function(response) {
                    response.pipe(file);
                });
            });
        } catch (err) {
            if (err.message == "Rights") {
                return res.status(400).json({ success: false, message: "You dont have rights to see this submissions" })
            } else if (err.message == "Not submit") {
                return res.status(400).json({ success: false, message: 'User doesnt submit' })
            }
        }

    }
    addCommentAndScore = async(req, res) => {
        try {
            const userId = req.userId
            const score = req.body.score
            const comment = req.body.comment
            const classId = req.body.classId
            const title = req.body.title
            const studentName = req.body.studentName

            // only teacher can add comment and score
            const isOK = await UserController.isUserATeacherOfClass(userId, classId)
            if (!isOK) {
                throw new Error("Rights")
            }

            await Submission.findOneAndUpdate({ classId: classId, title: title, studentName: studentName }, { $set: { score: score, comment: comment } })
            return res.status(200).json({ success: true, message: 'Added' })
        } catch (err) {
            if (err.message == "Rights") {
                return res.status(400).json({ success: false, message: 'Only teacher of class can add comment and score' })
            }
            console.log(err)
            return res.status(400).json({ success: false, message: 'ERROR' })
        }
    }
    getAllSubmissionMetadataOfHomework = async(req, res) => {
        const homeworkId = req.body.homeworkId
        const result = await Submission.find({ homeworkId: homeworkId }, "studentId status score")
            .populate({
                path: "studentId",
                select: "fullName username"
            })
        console.log(result)
        return res.status(200).json(result)
    }
}

module.exports = new SubmissionController()