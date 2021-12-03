/* const Document = require('../models/Document')
const fs = require('fs')
const path = require('path')
const formidable = require('formidable')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
    // const fs = require('fs')
const { GridFsStorage } = require('multer-gridfs-storage');
const mongoose = require('mongoose')

const storage = new GridFsStorage({ url: process.env.DATABASE_URL })
const Grid = require('gridfs-stream');

const mongodb = require('mongodb')

class DocumentController {
    upload = async(req, res) => {
        var classId = '2'
        var title = 'minhbaodeptrai'
            // assume that there is no 2 document have same title
        var description = 'oke'
        try {
            const { file } = req
            console.log(file)
            file.filename = classId + "-" + title
            const stream = fs.createReadStream(file.path);
            storage.fromStream(stream, req, file)
                .then(() => res.send('File uploaded'))
                .catch(() => res.status(500).send('error'));
        } catch (err) {
            res.status(400).json({ message: "failed" })
        }
    }
    download = async(req, res) => {
        var conn = await mongoose.connection;
        var gfs = Grid(conn.db, mongoose.mongo);
        gfs.findOne({ filename: "a78ea4960d1a8e8eb939ee191051b325" }, function(err, file) {
            if (err) {
                return res.status(400).send(err);
            } else if (!file) {
                return res.status(404).send('Error on the database looking for the file.');
            }

            res.set('Content-Type', file.contentType);
            res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

            var readstream = gfs.createReadStream({
                filename: "a78ea4960d1a8e8eb939ee191051b325"
            });

            readstream.on('open', function() {
                readstream.pipe(res)
            })

            readstream.on("error", function(err) {
                console.log(err)
                res.end();
            });
            // readstream.pipe(res);


        });
    };
};


module.exports = new DocumentController(); */