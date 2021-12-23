const firebase = require('../firebase');
const Document = require('../models/Document');
const Classroom = require('../models/Classroom');
const mongoose = require('mongoose');

const saveDocumentToMongoDB = async(_id, classroomId, title, description, creatorId, attachedFiles, topic, duplicateTopicId) => {
    const newDocument = new Document({ _id, classroomId, title, description, creatorId, attachedFiles, topic });
    await newDocument.save();

    // push new document to list document of class
    await Classroom.updateOne({ 'topicDocument._id': duplicateTopicId }, { $push: { 'topicDocument.$.documents': _id } });
};

const addNewTopic = async(classroomId, topic) => {
    var myId = mongoose.Types.ObjectId();
    await Classroom.updateOne({ _id: classroomId }, { $push: { topicDocument: { _id: myId, topic: topic, documents: [] } } });
    return myId;
};

getSignedUrlDocument = async(documentId, filename) => {
    const destinationFirebase = `document/${documentId}/${filename}`;
    const config = {
        action: 'read',
        expires: '08-08-2025',
    };
    const url = await firebase.bucket.file(destinationFirebase).getSignedUrl(config);
    return url;
};

const checkIfDuplicate = async(classroomId, topic) => {
    /* check if topic exists in class
     * return _id of topic if yes, otherwise return null
     * return topics array used for check title in next step
     */
    const updatedClassroom = await Classroom.findOne({ _id: classroomId }, 'topicDocument').populate({
        path: 'topicDocument.documents',
        select: 'title',
    });
    const topics = updatedClassroom.topicDocument;
    var duplicateTopicId = null;
    for (let i = 0; i < topics.length; i++) {
        if (topics[i].topic === topic) {
            duplicateTopicId = topics[i]._id;
            break;
        }
    }
    return { duplicateTopicId, topics };
};

const reverseDocumentIn1Topic = (topic) => {
    /* new document will be pushed at tail of array documents
     * we need to reverse documents array so new document will hoist to top of documents array
     */
    const n = topic.documents.length;
    for (let i = 0; i <= (n - 1) / 2; i++) {
        const temp = topic.documents[i];
        topic.documents[i] = topic.documents[n - 1 - i];
        topic.documents[n - 1 - i] = temp;
    }
};

const reverseTopic = (topics) => {
    /* new topic will be pushed at tail of topics array
       we need to reverse topics array so new topic will hoist to top of topics array
     */
    const n = topics.length;
    for (let i = 0; i <= (n - 1) / 2; i++) {
        const temp = topics[i];
        topics[i] = topics[n - 1 - i];
        topics[n - 1 - i] = temp;
        reverseDocumentIn1Topic(topics[i]);
        if (n > 1) reverseDocumentIn1Topic(topics[n - 1 - i]);
    }
};

const getIdOfTopic = (topics, topic) => {
    var topicId = null;
    for (let i = 0; i < topics.length; i++) {
        if (topics[i].topic === topic) {
            topicId = topics[i]._id;
            break;
        }
    }
    return topicId
}

const checkIfDuplicateTitle = (topics, title) => {
    // check if exists another documents with same title in class
    for (let i = 0; i < topics.length; i++) {
        for (let j = 0; j < topics[i].documents.length; j++) {
            if (topics[i].documents[j].title === title) {
                return true
            }
        }
    }
    return false
}

const changeTopic = async(duplicateTopicId, topicId, topic, documentId, classroomId) => {
    await Classroom.updateOne({ 'topicDocument._id': duplicateTopicId }, { $pull: { 'topicDocument.$.documents': documentId } })
    if (!topicId) {
        topicId = await addNewTopic(classroomId, topic);
    }
    console.log(topicId)
    await Classroom.updateOne({ 'topicDocument._id': topicId }, { $push: { 'topicDocument.$.documents': documentId } })
}

class DocumentController {
    upload = async(req, res) => {
        try {
            const classroomId = req.body.classroomId;
            const title = req.body.title;
            const description = req.body.description;
            const creatorId = req.userId;
            const topic = req.body.topic;

            var { duplicateTopicId, topics } = await checkIfDuplicate(classroomId, topic);
            const isTitleExist = checkIfDuplicateTitle(topics, title)
            if (isTitleExist) {
                throw new Error('2 documents have same title in 1 class')
            }
            if (!duplicateTopicId) {
                duplicateTopicId = await addNewTopic(classroomId, topic);
            }

            const attachedFiles = []

            const file = req.file;

            // if dont have file, save right now
            if (!file) {
                await saveDocumentToMongoDB(classroomId, title, description, creatorId, attachedFiles, topic, duplicateTopicId);
                return res.status(200).json({ success: true, message: 'Uploaded' });
            }

            // otherwise
            var _id = mongoose.Types.ObjectId();
            var options = {
                destination: `document/${_id}/${file.filename}`,
            };
            await firebase.bucket.upload(file.path, options);

            const url = await getSignedUrlDocument(_id, file.filename);
            attachedFiles.push(url[0]);
            await saveDocumentToMongoDB(_id, classroomId, title, description, creatorId, attachedFiles, topic, duplicateTopicId);
            return res.status(200).json({ success: true, message: 'Đã tải lên tài liệu thành công' });
        } catch (err) {
            if (err.message == '2 documents have same title in 1 class') {
                return res.status(400).json({ success: false, message: '1 lớp không thể có 2 tài liệu cùng tên' });
            } else {
                console.log(err);
                res.status(400).json({ success: false, message: 'ERROR' });
            }
        }
    };

    download = (req, res) => {
        try {
            const documentId = req.body.documentId;
            Document.findOne({ _id: documentId }, function(err, document) {
                try {
                    // if error or document not in database
                    if (err) {
                        throw new Error('ERROR');
                    }
                    if (!document) {
                        throw new Error('Document doesnt exist');
                    }

                    return res.status(200).json({ success: true, document });
                } catch (err) {
                    if (err.message == 'Document doesnt exist') return res.status(400).json({ success: false, message: 'Document doesnt exist' });
                    else {
                        return res.status(400).json({ success: false, message: 'ERROR' });
                    }
                }
            });
        } catch (err) {
            if (err.message == 'ERROR') {
                return res.status(400).json({ success: false, message: 'ERROR' });
            }
        }
    };

    getAllDocumentMetadataOfClass = async(req, res) => {
        const classroomId = req.body.classroomId;
        const topicDocument = await Classroom.findOne({ _id: classroomId }, 'topicDocument').populate({
            path: 'topicDocument.documents',
            select: 'title createdAt',
        });
        const topics = topicDocument.topicDocument;
        if (topics.length === 0) {
            return res.status(200).json(topics);
        }
        reverseTopic(topics);
        return res.status(200).json(topics);
    };

    changeDocument = async(req, res) => {
        try {
            const documentId = req.body.documentId
            const title = req.body.title
            const description = req.body.description
            const topic = req.body.topic

            const updatedDocument = await Document.findOne({ _id: documentId })
            if (!updatedDocument) {
                throw new Error("No document")
            }

            const classId = updatedDocument.classroomId
            const oldTopic = updatedDocument.topic

            var { duplicateTopicId, topics } = await checkIfDuplicate(classId, oldTopic)
            const isTitleExist = checkIfDuplicateTitle(topics, title)
            if (isTitleExist) {
                throw new Error('2 documents have same title in 1 class')
            }

            // consider to erase this block of code
            if (!duplicateTopicId) {
                throw new Error('ERROR')
            }

            var topicId = getIdOfTopic(topics, topic)

            if (oldTopic != topic) {
                await changeTopic(duplicateTopicId, topicId, topic, documentId, classId)
            }

            await Document.findOneAndUpdate({ _id: documentId }, { $set: { title: title, description: description, topic: topic } })
            return res.status(200).json({ success: true, message: "Change document successfully" })
        } catch (err) {
            if (err.message == '2 documents have same title in 1 class') {
                return res.status(400).json({ success: false, message: '1 lớp không thể có 2 tài liệu cùng tên' });
            } else {
                console.log(err);
                res.status(400).json({ success: false, message: 'ERROR' });
            }
        }
    }
}

module.exports = new DocumentController();