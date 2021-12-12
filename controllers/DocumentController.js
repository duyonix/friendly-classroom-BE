const firebase = require('../firebase')
const Document = require('../models/Document')
const Classroom = require('../models/Classroom')
const https = require('https');
const fs = require('fs');

const saveDocumentToMongoDB = async(classId, title, description, creatorId, attachedFiles) => {
    const newDocument = new Document({ classId, title, description, creatorId, attachedFiles })
    const result = await newDocument.save()
    await Classroom.updateOne({ _id: classId }, { $push: { listDocument: result._id } })
}

class DocumentController {
    upload = async(req, res) => {
        try {
            const classId = req.body.classId
            const title = req.body.title
            const description = req.body.description
            const creatorId = req.userId
            const attachedFiles = []
            const classroomDocument = await Classroom
                .findOne({ _id: classId }, "listDocument")
                .populate({
                    path: "listDocument",
                    match: {
                        title: title
                    },
                    select: "title"
                })
            if (classroomDocument.listDocument.length > 0) {
                throw new Error("2 documents have same name in 1 class")
            }
            const file = req.file
            if (!file) {
                await saveDocumentToMongoDB(classId, title, description, creatorId, attachedFiles)
                return res.status(200).json({ success: true, message: 'Uploaded' })
            }
            var options = {
                destination: `document/${classId}/${title}/${file.filename}`,
            };
            firebase.bucket.upload(file.path, options, async(err, item) => {
                try {
                    attachedFiles.push(file.filename)
                    await saveDocumentToMongoDB(classId, title, description, creatorId, attachedFiles)
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

                        const file = fs.createWriteStream("./uploads/files.pdf");
                        const request = https.get(url, function(response) {
                            response.pipe(file);
                        });
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

}

module.exports = new DocumentController()

// Structure firebase:

// storage
//     + document
//           . classId
//                - DocumentTitle
//                       File