const Homework = require('../models/Homework')
const firebase = require('../firebase')
const userController = require('./UserController')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

class HomeworkController {
    createHomework = async(req, res) => {
        try {
            const file = req.file
            const creatorId = req.body.creatorId
            const classId = req.body.classId
            const title = req.body.title
            const description = req.body.description
            const deadline = req.body.deadline

            /*const isValid = await userController.isUserATeacherOfClass(creatorId, classId)
            if (!isValid) {
                return res.status(400).json({ success: false, message: 'You dont have rights to create homework in this class' })
            }*/
            const options = {
                destination: `homework/${classId}/${title}/${file.filename}`
            }
            firebase.bucket.upload(file.path, options, function(err, fileFirebase) {
                const attachedFiles = [file.filename]
                const newHomework = new Homework({ classId, title, creatorId, description, deadline, attachedFiles })
                try {
                    newHomework.save()
                    return res.status(200).json({ success: true, message: 'Homework is added' })
                } catch (err) {
                    console.log(err)
                    return res.status(400).json({ success: false, message: 'ERROR' })
                }
            })
        } catch (err) {
            console.log(err)
            return res.status(400).json({ success: false, message: 'ERROR' })
        }

    }
    removeHomework = (req, res) => {

    }
    editHomeworkDeadline = async(req, res) => {
        try {
            const classId = req.body.classId
            const title = req.body.title
            const newDeadline = req.body.newDeadline
            await Homework.updateOne({ classId: classId, title: title }, { $set: { deadline: newDeadline } })
            return res.status(200).json({ success: true, message: 'Deadline is changed' })
        } catch (err) {
            console.log(err)
            return res.status(400).json({ success: false, message: 'Error in changing deadline' })
        }
    }
    getAllHomeworkMetadataOfClass = async(req, res) => {
        try {
            const classId = req.body.classId
            console.log(classId)
            const homeworks = await Homework.find({ classId: classId }, "title deadline")
            return res.status(200).json(homeworks)
        } catch (err) {
            console.log(err)
            return res.status(400).json({ success: false, message: 'ERROR' })
        }

    }
    getHomeworkDetail = async(req, res) => {
        try {
            const classId = req.body.classId
            const title = req.body.title
            const homework = await Homework.findOne({ title: title, classId: classId })
            if (!homework) {
                return res.status(400).json({ success: false, message: "Homework doesnt exists" })
            }
            console.log(homework)
            const destinationFirebase = `homework/${homework.classId}/${homework.title}/${homework.attachedFiles[0]}`
            const config = {
                action: 'read',
                expires: '03-17-2025'
            };
            firebase.bucket.file(destinationFirebase).getSignedUrl(config, function(err, url) {
                if (err) {
                    return res.status(400).json({ success: false, message: 'ERROR' })
                }
                return res.status(200).json({ success: true, homework, downloadURL: url })

                const file = fs.createWriteStream("./uploads/files.pdf");
                const request = https.get(url, function(response) {
                    response.pipe(file);
                });
            });

        } catch (err) {
            console.log(err)
            return res.status(400).json("ERROR")
        }
    }
}

module.exports = new HomeworkController()