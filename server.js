require('dotenv').config();

const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const auth = require('./middlewares/auth');
=======
const auth = require('./middleware/auth');
// const jwt = require('jsonwebtoken');
>>>>>>> d0b46e002a706a0cc02e2ef1e03fa2ce666dbaa6
const route = require('./routes');
const path = require('path')
const db = require('./config/db');
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const fs = require('fs')
const { GridFsStorage } = require('multer-gridfs-storage');

db.connect()
const storage = new GridFsStorage({ url: process.env.DATABASE_URL });
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

app.post('/test', upload.single('file'), function(req, res, next) {
    const { file } = req
    console.log(storage)
    const stream = fs.createReadStream(file.path)
    storage.fromStream(stream, req, file)
        .then(() => res.send("File uploaded"))
        .catch(() => res.status(500).send("ERROR"))
})

route(app);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server listen on ${PORT}`);
});