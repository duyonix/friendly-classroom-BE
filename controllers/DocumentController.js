const Document = require('../models/Document')
const fs = require('fs')
const path = require('path')

class DocumentController {
    upload = async(req, res) => {
        var classId = '1'
        var title = 'minhbaodeptrai'
        var description = 'oke'
        try {
            console.log(__dirname)
            var urlTestFile = path.join(__dirname, '../testingFolder/minhbao.pdf')
            var urlTestFile2 = path.join(__dirname, '../testingFolder/minhbao2.pdf')
            fs.readFile(urlTestFile, 'utf8', async function(err, data) {
                if (err) throw err;
                console.log(data);
                // const newDocument = new Document({ classId, title, description, data });
                // await newDocument.save()
                fs.writeFile(urlTestFile2, data, function(err) {
                    if (err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                });
                res.json({ message: "saved" })
            });
        } catch (err) {
            console.log(err)
            res.json({ message: "failed" })
        }
    }
    download = async(req, res) => {
        const documents = await Document.find()
        var urlTestFile = path.join(__dirname, '../testingFolder/minhbao.pdf')
            // console.log(documents[0].data.data)
        fs.writeFile(urlTestFile, documents[0].data, function(err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });

    }
}

module.exports = new DocumentController();