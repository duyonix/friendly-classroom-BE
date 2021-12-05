const Document = require('../models/Document')
const fs = require('fs')
const path = require('path')
const { appFirebase } = require('../server.firebase')
const firebase = require('../firebase')
const { getStorage, ref, getDownloadURL } = require("firebase/storage");
const storage = getStorage();

class DocumentController {
    upload = async(req, res) => {
        try {
            const classId = req.body.classId
            const title = req.body.title
            const creatorName = req.body.creatorName
            const description = req.body.description
            firebase.bucket.upload(req.file.path, {
                metadata: {
                    contentType: req.file.mimetype
                },
                destination: `document/${classId}/${title}/${req.file.filename}`
            }).then(async(data) => {
                const attachedFiles = [req.file.filename]
                const newDocument = new Document({ classId, title, description, creatorName, attachedFiles })
                await newDocument.save()
                return res.status(200).json({ success: true, message: 'Upload successfully' })
            })
        } catch (err) {
            return res.status(400).json({ success: false, message: "Failed" })
        }
    }
    download = async(req, res) => {
        console.log(req)
        const classId = req.body.classId
        const title = req.body.title
        console.log(classId)
        console.log(title)
        try{
            Document.findOne({ classId: classId, title: title }, function(err, document) {
                if (err) {
                    return res.status(400).json({ success: false, message: 'Document doesnt exists' })
                }
                getDownloadURL(ref(storage, `document/${classId}/${title}/${document.attachedFiles[0]}`))
                    .then(url=>{
                        return res.status(200).json({document: document, downloadUrl: url})
                    })
            })
        }catch(err){
            return res.status(400).json({success: false, message: 'ERROR'})
        }
    }
}

module.exports = new DocumentController();