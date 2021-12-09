const firebase = require('../firebase')
const Document = require('../models/Document')
const https = require('https');
const fs = require('fs');


class DocumentController {
    upload = (req, res) => {
        const classId = req.body.classId
        const title = req.body.title
        const description = req.body.description
        const creatorName = req.body.username

        // auth access token
        const file = req.file
        var options = {
            destination: `document/${classId}/${title}/${file.filename}`,
        };
        firebase.bucket.upload(file.path, options, async function(err, item) {
            try {
                const attachedFiles = [file.filename]
                const newDocument = new Document({ classId, title, description, creatorName, attachedFiles })
                await newDocument.save()
                return res.status(200).json({ success: true, message: 'Uploaded' })
            } catch (err) {
                console.log(err);
                res.status(400).json({ success: false, message: 'ERROR' });
            }

        })

    }
    download = (req, res) => {
        try {
            const classId = req.body.classId
            const title = req.body.title
            Document.findOne({ classId: classId, title: title }, function(err, document) {
                if (err) {
                    return res.status(400).json({ success: false, message: 'ERROR' })
                }
                if (!document) {
                    return res.status(400).json({ success: false, message: 'Document doesnt exists' })
                }
                const urlFile = `document/${classId}/${title}/${document.attachedFiles[0]}`
                const config = {
                    action: 'read',
                    expires: '03-17-2025'
                };
                firebase.bucket.file(urlFile).getSignedUrl(config, function(err, url) {
                    if (err) {
                        return res.status(400).json({ success: false, message: 'ERROR' })
                    }
                    return res.status(200).json({ success: true, document, downloadURL: url })

                    const file = fs.createWriteStream("./uploads/files.pdf");
                    const request = https.get(url, function(response) {
                        response.pipe(file);
                    });
                });

            })
        } catch (err) {
            return res.status(400).json({ success: false, message: 'ERROR' })
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