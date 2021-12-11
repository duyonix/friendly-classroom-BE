const Submission = require('../models/Submission')
const firebase = require('../firebase')

const UserController = require('./UserController')

class SubmissionController {
    submitSubmission = (req, res) => {
        const studentName = req.username
            // const username = req.username
        const classId = req.body.classId
        const title = req.body.title

        const file = req.file

        console.log(file)

        if (!file) {
            return res.status(400).json({ success: false, message: 'Where is your submission ?' })
        }

        const newFilename = `${studentName}.${file.filename.split('.')[1]}`
            // const newFilename = 'MinhBaoDinh.docx'
        console.log(newFilename)
        console.log(classId)
        console.log(title)
        var optionsFirebase = {
            destination: `submission/${classId}/${title}/${newFilename}`
        }

        console.log(optionsFirebase.destination)

        firebase.bucket.upload(file.path, optionsFirebase, async function(err, item) {
            console.log('Uploaded to firebase')
            const status = 'DONE'
            const attachedFiles = [newFilename]
            const newSubmission = new Submission({ classId, title, studentName, status, attachedFiles })
            await newSubmission.save()
            return res.status(200).json({ success: true, message: 'Submitted' })
        })
    }
    getSubmission = async(req, res) => {
        // const studentId = req.userId
        const userId = req.userId
        const username = req.username
        const classId = req.body.classId
        const title = req.body.title

        const studentName = req.body.studentName

        // only teacher and that student can get his submission
        if (username != studentName) {
            const isOK = await UserController.isUserATeacherOfClass(userId, classId)
            if (!isOK) {
                return res.status(400).json({ success: false, message: "You dont have rights to see this submissions" })
            }
        }


        const submission = await Submission.findOne({ classId: classId, studentName: studentName, title: title })
        if (!submission) {
            return res.status(400).json({ success: false, message: 'User doesnt submit' })
        }

        const destinationFirebase = `submission/${classId}/${title}/${submission.attachedFiles[0]}`
        const config = {
            action: 'read',
            expires: '03-17-2025'
        };
        firebase.bucket.file(destinationFirebase).getSignedUrl(config, function(err, url) {
            if (err) {
                return res.status(400).json({ success: false, message: 'ERROR' })
            }
            return res.status(200).json({ success: true, submission, downloadURL: url })

            const file = fs.createWriteStream("./uploads/files.pdf");
            const request = https.get(url, function(response) {
                response.pipe(file);
            });
        });
    }
    addCommentAndScore = async(req, res) => {
        try {
            const userId = req.userId
            const username = req.username

            const score = req.body.score
            const comment = req.body.comment

            const classId = req.body.classId
            const title = req.body.title
            const studentName = req.body.studentName

            // only teacher can add comment and score

            const isOK = await UserController.isUserATeacherOfClass(userId, classId)
            if (!isOK) {
                return res.status(400).json({ success: false, message: 'Only teacher of class can add comment and score' })
            }

            await Submission.findOneAndUpdate({ classId: classId, title: title, studentName: studentName }, { $set: { score: score, comment: comment } })
            return res.status(200).json({ success: true, message: 'Added' })
        } catch (err) {
            console.log(err)
            return res.status(400).json({ success: false, message: 'ERROR' })
        }




    }
    getAllSubmissionOfHomework = (req, res) => {

    }
}

module.exports = new SubmissionController()