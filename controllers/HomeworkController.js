const Homework = require('../models/Homework')
const firebase = require('../firebase')
const userController = require('./UserController')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const Classroom = require('../models/Classroom')

saveHomeworkToMongodb = async(classId, title, creatorId, description, deadline, attachedFiles) => {
    const newHomework = new Homework({ classId, title, creatorId, description, deadline, attachedFiles })
    const result = await newHomework.save()
    await Classroom.updateOne({ _id: classId }, { $push: { listHomework: result._id } })
}

class HomeworkController {
    createHomework = async(req, res) => {
        try {
            const file = req.file
            const creatorId = req.userId
            const classId = req.body.classId
            const title = req.body.title
            const description = req.body.description
            const deadline = req.body.deadline // yyyy/mm/dd hh:mm:ss
            const attachedFiles = []

            // Only teacher of class can create homework
            const isValid = await userController.isUserATeacherOfClass(creatorId, classId)
            if (!isValid) {
                throw new Error('Rights')
            }

            if (!file) {
                saveHomeworkToMongodb(classId, title, creatorId, description, deadline, attachedFiles)
                return res.status(200).json({ success: true, message: "Homework is added" })
            }
            const options = {
                destination: `homework/${classId}/${title}/${file.filename}`
            }
            firebase.bucket.upload(file.path, options, async function(err, fileFirebase) {
                attachedFiles.push(file.filename)
                try {
                    saveHomeworkToMongodb(classId, title, creatorId, description, deadline, attachedFiles)
                    return res.status(200).json({ success: true, message: "Homework is added" })
                } catch (err) {
                    console.log(err)
                    return res.status(400).json({ success: false, message: 'ERROR' })
                }
            })
        } catch (err) {
            if (err.message == 'Rights') {
                return res.status(400).json({ success: false, message: 'Only teacher can create homework' })
            } else {
                console.log(err)
                return res.status(400).json({ success: false, message: 'ERROR' })
            }
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
                throw new Error('Not exists')
            }
            if (homework.attachedFiles.length == 0) {
                return res.status(200).json({ success: true, homework })
            }
            const destinationFirebase = `homework/${homework.classId}/${homework.title}/${homework.attachedFiles[0]}`
            const config = {
                action: 'read',
                expires: '03-17-2025'
            };
            firebase.bucket.file(destinationFirebase).getSignedUrl(config, function(err, url) {
                try {
                    if (err) {
                        throw new Error('ERROR')
                    }
                } catch (err) {
                    return res.status(400).json({ success: false, message: 'ERROR' })
                }
                return res.status(200).json({ success: true, homework, downloadURL: url })

                const file = fs.createWriteStream("./uploads/files.pdf");
                const request = https.get(url, function(response) {
                    response.pipe(file);
                });
            });

        } catch (err) {
            if (err.message == 'Not exists') {
                return res.status(400).json({ success: false, message: "Homework doesnt exists" })
            } else {
                console.log(err)
                return res.status(400).json("ERROR")
            }
        }
    }
}

module.exports = new HomeworkController()