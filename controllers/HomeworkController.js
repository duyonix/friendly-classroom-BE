const Homework = require('../models/Homework');
const firebase = require('../firebase');
const userController = require('./UserController');
const mongoose = require('mongoose');
const Classroom = require('../models/Classroom');
const Submission = require('../models/Submission');

saveHomeworkToMongodb = async (_id, classroomId, title, creatorId, description, deadline, attachedFiles, topic, duplicateTopicId) => {
    const newHomework = new Homework({ _id, classroomId, title, creatorId, description, deadline, attachedFiles, topic });
    await newHomework.save();
    createFakeSubmissionForEveryMemberInClass(classroomId, _id);

    // push new homework to list homework of class
    await Classroom.updateOne({ 'topicHomework._id': duplicateTopicId }, { $push: { 'topicHomework.$.homeworks': _id } });
};

createFakeSubmissionForEveryMemberInClass = async (classroomId, homeworkId) => {
    // When teacher create homework, every student in class have default submission
    const classMember = await Classroom.findOne({ _id: classroomId }, 'listStudent');
    const status = 'TO DO';
    const attachedFiles = [];
    classMember.listStudent.forEach((studentId) => {
        const newSubmission = new Submission({ homeworkId, studentId, status, attachedFiles });
        newSubmission.save(); // consider to await
    });
};

getSignedUrlHomework = async (homeworkId, filename) => {
    const destinationFirebase = `homework/${homeworkId}/${filename}`;
    const config = {
        action: 'read',
        expires: '08-08-2025',
    };
    const url = await firebase.bucket.file(destinationFirebase).getSignedUrl(config);
    return url;
};

const max = (a, b) => {
    return a > b ? a : b;
};

const reverseHomeworkIn1Topic = (topic) => {
    /*  New homework is pushed at tail of homeworks array
     *  We need to reverse homeworks array so the new homework will hoist to top
     */
    const n = topic.homeworks.length;
    for (let i = 0; i <= max(n / 2 - 1, 0); i++) {
        const temp = topic.homeworks[i];
        topic.homeworks[i] = topic.homeworks[n - 1 - i];
        topic.homeworks[n - 1 - i] = temp;
    }
};

const reverseTopic = (topics) => {
    /* New topic is pushed at tail of topics array
     * We need to reverse topics array so the new topic will hoist to top
     */
    const n = topics.length;
    for (let i = 0; i <= max(n / 2 - 1, 0); i++) {
        const temp = topics[i];
        topics[i] = topics[n - 1 - i];
        topics[n - 1 - i] = temp;
        reverseHomeworkIn1Topic(topics[i]);
        if (n > 1) reverseHomeworkIn1Topic(topics[n - 1 - i]);
    }
};

const addNewTopic = async (classroomId, topic) => {
    var myId = mongoose.Types.ObjectId();
    await Classroom.updateOne({ _id: classroomId }, { $push: { topicHomework: { _id: myId, topic: topic, homeworks: [] } } });
    return myId;
};

const checkIfDuplicate = async (classroomId, topic) => {
    /* check if we have same topic in class
     * return id of topic if yes, otherwise is null
     * return array of topics can be used for check if we have homework with same title in class
     */
    const updatedClassroom = await Classroom.findOne({ _id: classroomId }, 'topicHomework').populate({
        path: 'topicHomework.homeworks',
        select: 'title',
    });
    const topics = updatedClassroom.topicHomework;
    var duplicateTopicId = null;
    for (let i = 0; i < topics.length; i++) {
        if (topics[i].topic === topic) {
            duplicateTopicId = topics[i]._id;
            break;
        }
    }
    return { duplicateTopicId, topics };
};

class HomeworkController {
    createHomework = async (req, res) => {
        try {
            const file = req.file;
            const creatorId = req.userId;
            const classroomId = req.body.classroomId;
            const title = req.body.title;
            const description = req.body.description;
            const deadline = req.body.deadline; // yyyy/mm/dd hh:mm:ss
            const topic = req.body.topic;
            const attachedFiles = [];

            /*
            // Only teacher of class can create homework
            const isValid = await userController.isUserATeacherOfClass(creatorId, classroomId)
            if (!isValid) {
                throw new Error('Rights')
            }
            */

            var { duplicateTopicId, topics } = await checkIfDuplicate(classroomId, topic);
            if (!duplicateTopicId) {
                duplicateTopicId = await addNewTopic(classroomId, topic);
            }

            // check if class has homework which has same title
            for (let i = 0; i < topics.length; i++) {
                for (let j = 0; j < topics[i].homeworks.length; j++) {
                    if (topics[i].homeworks[j].title === title) {
                        throw new Error('2 homeworks have same name in 1 class');
                    }
                }
            }
            var _id = mongoose.Types.ObjectId();

            // If dont have file, save right now
            if (!file) {
                await saveHomeworkToMongodb(_id, classroomId, title, creatorId, description, deadline, attachedFiles, topic, duplicateTopicId);
                return res.status(200).json({ success: true, message: 'Homework is added' });
            }

            // If have file, save file first and save in mongodb later
            // place I save file homework on Firebase
            const options = {
                destination: `homework/${_id}/${file.filename}`,
            };
            await firebase.bucket.upload(file.path, options);
            const url = await getSignedUrlHomework(_id, file.filename);
            attachedFiles.push(url[0]);
            await saveHomeworkToMongodb(_id, classroomId, title, creatorId, description, deadline, attachedFiles, topic, duplicateTopicId);
            return res.status(200).json({ success: true, message: 'Bài tập đã thêm thành công' });
        } catch (err) {
            if (err.message == 'Rights') {
                return res.status(400).json({ success: false, message: 'Only teacher can create homework' });
            } else if (err.message === '2 homeworks have same name in 1 class') {
                return res.status(400).json({ success: false, message: 'Không thể có 2 bài tập về nhà cùng tên được' });
            } else {
                console.log(err);
                return res.status(400).json({ success: false, message: 'ERROR' });
            }
        }
    };
    removeHomework = (req, res) => {};
    editHomeworkDeadline = async (req, res) => {
        try {
            const classroomId = req.body.classroomId;
            const title = req.body.title;
            const newDeadline = req.body.newDeadline;
            await Homework.updateOne({ classroomId: classroomId, title: title }, { $set: { deadline: newDeadline } });
            return res.status(200).json({ success: true, message: 'Deadline is changed' });
        } catch (err) {
            console.log(err);
            return res.status(400).json({ success: false, message: 'Error in changing deadline' });
        }
    };
    getAllHomeworkMetadataOfClass = async (req, res) => {
        // return title and deadline of all homework in 1 class
        const classroomId = req.body.classroomId;
        const topicHomework = await Classroom.findOne({ _id: classroomId }, 'topicHomework').populate({
            path: 'topicHomework.homeworks',
            select: 'title deadline',
        });
        const topics = topicHomework.topicHomework;

        // We need to reverse topics so newly topic will hoist to top
        reverseTopic(topics);
        return res.status(200).json(topics);
    };

    getHomeworkDetail = async (req, res) => {
        // get all information about homework
        try {
            const homeworkId = req.body.homeworkId;
            const homework = await Homework.findOne({ _id: homeworkId });
            if (!homework) {
                throw new Error('Not exists');
            }
            return res.status(200).json({ success: true, homework });
        } catch (err) {
            if (err.message == 'Not exists') {
                return res.status(400).json({ success: false, message: 'Homework doesnt exists' });
            } else {
                console.log(err);
                return res.status(400).json('ERROR');
            }
        }
    };
}

module.exports = new HomeworkController();
