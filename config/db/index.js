require('dotenv').config();
const mongoose = require('mongoose');
const { GridFsStorage } = require('multer-gridfs-storage');

async function connect() {
    /*try {
        const connection = await mongoose.connect(process.env.DATABASE_URL);
        const storage = new GridFsStorage({ db: connection })
        console.log('Connect successfully!!!');
        return storage
    } catch (error) {
        console.log(error)
        console.log('Connect failure!!!');
    }*/

    try {
        await mongoose.connect(process.env.DATABASE_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false,
        });
        console.log('Connect MongoDB successfully!!!');
    } catch (error) {
        console.log('Connect MongoDB failure!!!');
        process.exit(1);
    }
}

module.exports = { connect };
