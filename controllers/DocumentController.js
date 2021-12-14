const firebase = require('../firebase')
const Document = require('../models/Document')
const Classroom = require('../models/Classroom')
const mongoose = require('mongoose')

const saveDocumentToMongoDB = async(classId, title, description, creatorId, attachedFiles, topic, duplicateTopicId) => {
    const newDocument = new Document({ classId, title, description, creatorId, attachedFiles, topic })
    const result = await newDocument.save()
    await Classroom.updateOne({ "topicDocument._id": duplicateTopicId }, { $push: { 'topicDocument.$.documents': result._id } })
}

const addNewTopic = async(classId, topic) => {
    var myId = mongoose.Types.ObjectId();
    await Classroom.updateOne({ _id: classId }, { $push: { topicDocument: { _id: myId, topic: topic, documents: [] } } })
    return myId
}

const checkIfDuplicate = async(classId, topic) => {
    const updatedClassroom = await Classroom.findOne({ _id: classId }, "topicDocument")
        .populate({
            path: "topicDocument.documents",
            select: "title"
        })
    const topics = updatedClassroom.topicDocument
    var duplicateTopicId = null
    for (let i = 0; i < topics.length; i++) {
        if (topics[i].topic === topic) {
            duplicateTopicId = topics[i]._id
            break
        }
    }
    return { duplicateTopicId, topics }
}

const reverseDocumentIn1Topic = (topic) => {
    const n = topic.documents.length
    for (let i = 0; i <= (n - 1) / 2; i++) {
        const temp = topic.documents[i]
        topic.documents[i] = topic.documents[n - 1 - i]
        topic.documents[n - 1 - i] = temp
    }
}

const reverseTopic = (topics) => {
    const n = topics.length
    console.log(n)
    for (let i = 0; i <= (n - 1) / 2; i++) {
        const temp = topics[i]
        topics[i] = topics[n - 1 - i]
        topics[n - 1 - i] = temp
        reverseDocumentIn1Topic(topics[i])
        reverseDocumentIn1Topic(topics[n - 1 - i])
    }
}

class DocumentController {
    upload = async(req, res) => {
        try {
            const classId = req.body.classId
            const title = req.body.title
            const description = req.body.description
            const creatorId = req.userId
            const topic = req.body.topic
            var { duplicateTopicId, topics } = await checkIfDuplicate(classId, topic)
            if (!duplicateTopicId) {
                duplicateTopicId = await addNewTopic(classId, topic)
            }
            const attachedFiles = []
            for (let i = 0; i < topics.length; i++) {
                for (let j = 0; j < topics[i].documents.length; j++) {
                    if (topics[i].documents[j].title === title) {
                        throw new Error("2 documents have same name in 1 class")
                    }
                }
            }
            const file = req.file
            if (!file) {
                await saveDocumentToMongoDB(classId, title, description, creatorId, attachedFiles, topic, duplicateTopicId)
                return res.status(200).json({ success: true, message: 'Uploaded' })
            }
            var options = {
                destination: `document/${classId}/${title}/${file.filename}`,
            };
            firebase.bucket.upload(file.path, options, async(err, item) => {
                try {
                    attachedFiles.push(file.filename)
                    await saveDocumentToMongoDB(classId, title, description, creatorId, attachedFiles, topic, duplicateTopicId)
                    return res.status(200).json({ success: true, message: 'Uploaded' })
                } catch (err) {
                    console.log(err);
                    res.status(400).json({ success: false, message: 'ERROR' });
                }

            })
        } catch (err) {
            if (err.message == "2 documents have same name in 1 class") {
                return res.status(400).json({ success: false, message: "1 lớp không thể có 2 tài liệu cùng tên" })
            } else {
                console.log(err)
                res.status(400).json({ success: false, message: 'ERROR' });
            }
        }
    }

    download = (req, res) => {
        try {
            const classId = req.body.classId
            const title = req.body.title
            Document.findOne({ classId: classId, title: title }, function(err, document) {
                try {
                    if (err) {
                        throw new Error('ERROR')
                    }
                    if (!document) {
                        throw new Error('Document doesnt exist')
                    }
                    if (document.attachedFiles.length == 0) {
                        return res.status(200).json({ success: true, document })
                    }
                    const urlFile = `document/${classId}/${title}/${document.attachedFiles[0]}`
                    const config = {
                        action: 'read',
                        expires: '03-17-2025'
                    };
                    firebase.bucket.file(urlFile).getSignedUrl(config, function(err, url) {
                        try {
                            if (err) {
                                throw new Error('ERROR')
                            }
                        } catch (err) {
                            return res.status(400).json({ success: false, message: 'ERROR' })
                        }
                        return res.status(200).json({ success: true, document, downloadURL: url })
                    });
                } catch (err) {
                    if (err.message == 'Document doesnt exist')
                        return res.status(400).json({ success: false, message: 'Document doesnt exist' })
                    else {
                        return res.status(400).json({ success: false, message: 'ERROR' })
                    }
                }
            })
        } catch (err) {
            if (err.message == 'ERROR') {
                return res.status(400).json({ success: false, message: 'ERROR' })
            }

        }
    }

    getAllDocumentMetadataOfClass = async(req, res) => {
        const classId = req.body.classId
        const topicDocument = await Classroom.findOne({ _id: classId }, "topicDocument")
            .populate({
                path: "topicDocument.documents",
                select: "title createdAt"
            })
        const topics = topicDocument.topicDocument
        reverseTopic(topics)
        return res.status(200).json(topics)
    }
}

module.exports = new DocumentController()