const Homework = require('../models/Homework')
const firebase = require('../firebase')
const userController = require('./UserController')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types

const Classroom = require('../models/Classroom')
const Submission = require('../models/Submission')

saveHomeworkToMongodb = async(classId, title, creatorId, description, deadline, attachedFiles, topic, duplicateTopicId) => {
    const newHomework = new Homework({ classId, title, creatorId, description, deadline, attachedFiles, topic })
    const result = await newHomework.save()
    createFakeSubmissionForEveryMemberInClass(classId, result._id)
    await Classroom.updateOne({ "topicHomework._id": duplicateTopicId }, { $push: { 'topicHomework.$.homeworks': result._id } })
}

createFakeSubmissionForEveryMemberInClass = async(classId, homeworkId) => {
    const classMember = await Classroom.findOne({ _id: classId }, "listStudent")
    const status = "TO DO"
    const attachedFiles = []
    classMember.listStudent.forEach(studentId => {
        const newSubmission = new Submission({ homeworkId, studentId, status, attachedFiles })
        newSubmission.save()
    });
}

getSignedUrlHomework = async(classId, title, filename) => {
    const destinationFirebase = `homework/${classId}/${title}/${filename}`
    const config = {
        action: 'read',
        expires: '03-17-2025'
    };
    const url = await firebase.bucket.file(destinationFirebase).getSignedUrl(config);
    return url
}

const max = (a, b) => {
    return a > b ? a : b
}

const reverseHomeworkIn1Topic = (topic) => {
    const n = topic.homeworks.length
    for (let i = 0; i <= max(n / 2 - 1, 0); i++) {
        const temp = topic.homeworks[i]
        topic.homeworks[i] = topic.homeworks[n - 1 - i]
        topic.homeworks[n - 1 - i] = temp
    }
    // console.log(topic.homeworks)
}

const reverseTopic = (topics) => {
    const n = topics.length
    for (let i = 0; i <= max(n / 2 - 1, 0); i++) {
        console.log(i)
        const temp = topics[i]
        topics[i] = topics[n - 1 - i]
        topics[n - 1 - i] = temp
        reverseHomeworkIn1Topic(topics[i])
        if (n > 1) reverseHomeworkIn1Topic(topics[n - 1 - i])
    }
}

const addNewTopic = async(classId, topic) => {
    var myId = mongoose.Types.ObjectId();
    await Classroom.updateOne({ _id: classId }, { $push: { topicHomework: { _id: myId, topic: topic, homeworks: [] } } })
    return myId
}

const checkIfDuplicate = async(classId, topic) => {
    const updatedClassroom = await Classroom.findOne({ _id: classId }, "topicHomework")
        .populate({
            path: "topicHomework.homeworks",
            select: "title"
        })
    const topics = updatedClassroom.topicHomework
    console.log(topics)
    var duplicateTopicId = null
    for (let i = 0; i < topics.length; i++) {

        if (topics[i].topic === topic) {
            duplicateTopicId = topics[i]._id
            break
        }
    }
    return { duplicateTopicId, topics }
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
            const topic = req.body.topic
            const attachedFiles = []
                // Only teacher of class can create homework
                // Consider to erase this
            const isValid = await userController.isUserATeacherOfClass(creatorId, classId)
            if (!isValid) {
                throw new Error('Rights')
            }
            var { duplicateTopicId, topics } = await checkIfDuplicate(classId, topic)
            if (!duplicateTopicId) {
                duplicateTopicId = await addNewTopic(classId, topic)
            }
            for (let i = 0; i < topics.length; i++) {
                for (let j = 0; j < topics[i].homeworks.length; j++) {
                    if (topics[i].homeworks[j].title === title) {
                        throw new Error("2 homeworks have same name in 1 class")
                    }
                }
            }
            if (!file) {
                await saveHomeworkToMongodb(classId, title, creatorId, description, deadline, attachedFiles, topic, duplicateTopicId)
                return res.status(200).json({ success: true, message: "Homework is added" })
            }
            const options = {
                destination: `homework/${classId}/${title}/${file.filename}`
            }
            firebase.bucket.upload(file.path, options, async function(err, fileFirebase) {
                const url = await getSignedUrlHomework(classId, title, file.filename)
                attachedFiles.push(url[0])
                try {
                    await saveHomeworkToMongodb(classId, title, creatorId, description, deadline, attachedFiles, topic, duplicateTopicId)
                    return res.status(200).json({ success: true, message: "Homework is added" })
                } catch (err) {
                    console.log(err)
                    return res.status(400).json({ success: false, message: 'ERROR' })
                }
            })
        } catch (err) {
            if (err.message == 'Rights') {
                return res.status(400).json({ success: false, message: 'Only teacher can create homework' })
            } else if (err.message === "2 homeworks have same name in 1 class") {
                return res.status(400).json({ success: false, message: 'Không thể có 2 bài tập về nhà cùng tên được' })
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
        const classId = req.body.classId
        console.log(classId)
        const topicHomework = await Classroom.findOne({ _id: classId }, "topicHomework")
            .populate({
                path: "topicHomework.homeworks",
                select: "title deadline"
            })
        console.log(topicHomework)
        const topics = topicHomework.topicHomework
        reverseTopic(topics)
        return res.status(200).json(topics)
    }

    getHomeworkDetail = async(req, res) => {
        try {
            const classId = req.body.classId
            const title = req.body.title
            const homework = await Homework.findOne({ title: title, classId: classId })
            if (!homework) {
                throw new Error('Not exists')
            }
            return res.status(200).json({ success: true, homework })

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