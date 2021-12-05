const firebase = require('../firebase')
const Document = require('../models/Document')

class DocumentController {
    upload = (req, res) => {
        const classId = req.body.classId
        const title = req.body.title
        const description = req.body.description
        const creatorName = req.creatorName
        const file = req.file
        var options = {
            destination: `document/${classId}/${title}/${file.filename}`
        };
        firebase.bucket.upload(file.path, options, async function(err, item) {
            try {
                const attachedFiles = [file.filename]
                console.log(attachedFiles)
                const newDocument = new Document({ classId, title, description, creatorName, attachedFiles })
                console.log(newDocument)
                await newDocument.save()
                return res.status(200).json({ success: true, message: 'Uploaded' })
            } catch (err) {
                console.log(err)
                res.status(400).json({ success: false, message: 'ERROR' })
            }

        })

    }
    download = (req, res) => {

    }
}

module.exports = new DocumentController()