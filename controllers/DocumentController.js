const Document = require('../models/Document')
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')


class DocumentController {
    upload = async(req, res) => {
        console.log("Called")
        var classId = '2'
        var title = 'minhbaodeptrai'
        var description = 'oke'
        try {
            var urlTestFile = path.join(__dirname, '../testingFolder/minhbao.pdf')
            var urlTestFile2 = path.join(__dirname, '../testingFolder/minhbao2.pdf')
            fs.readFile(urlTestFile, 'latin1', async function(err, data) {
                console.log(data)

                if (err) throw err;
                var newDocument = new Document({ classId, title, description, data })
                await newDocument.save()
                    /*fs.writeFile(urlTestFile2, data, 'latin1', function(err) {
                        if (err) {
                            return console.log(err);
                        }
                        console.log("The file was saved!");
                    });*/
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
            console.log("The file was saved!");
        });

    }
}

module.exports = new DocumentController();