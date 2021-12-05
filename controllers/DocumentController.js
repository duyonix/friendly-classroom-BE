const Document = require('../models/Document')
const fs = require('fs')
const path = require('path')
    // const formidable = require('formidable')


class DocumentController {
    upload = async(req, res) => {

        const file = req.file
        console.log(file)
            // return res.status(200).json({ message: "success" })

        console.log("Called")
        var classId = '2'
        var title = 'minhbaodeptrai'
        var description = 'oke'
        try {
            fs.readFile(urlTestFile, 'latin1', async function(err, data) {
                console.log(data)

                if (err) throw err;
                var newDocument = new Document({ classId, title, description, data })
                await newDocument.save()
                res.json({ message: "saved", data: data })
            });
        } catch (err) {
            res.json({ message: "failed" })
        }
    }
    download = async(req, res) => {
        const documents = await Document.find()
        var urlTestFile = path.join(__dirname, '../testingFolder/minhbao2.pdf')
        fs.writeFile(urlTestFile, documents[0].data, 'latin1', function(err) {
            if (err) {
                return console.log(err);
            }
            var readstream = fs.createReadStream(urlTestFile)
            readstream.on('open', function() {
                readstream.pipe(res);
            });
            readstream.on('error', function(err) {
                res.end(err);
            });
            console.log("The file was saved!");
        });

    }
}

module.exports = new DocumentController();