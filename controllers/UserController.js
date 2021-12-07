const User = require("../models/User")
const firebase = require('../firebase')
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema.Types;

class UserController {
    getInformation = (req, res) => {
        const userId = req.userId
        const username = req.username
        User.findOne({ username: username }, async function(err, user) {
            if (err) {
                return res.status(400).json({ success: false, message: 'User doesnt exists' })
            }
            if (user.avatar == null) {
                return res.status(400).json({ success: true, user })
            }
            const urlAvatar = `avatar/${user.avatar}`
            const config = {
                action: 'read',
                expires: '03-17-2025'
            };
            firebase.bucket.file(urlAvatar).getSignedUrl(config, (err, url) => {
                if (err) {
                    return res.status(400).json({ success: true, message: 'ERROR' })
                }
                return res.status(200).json({ success: true, user, avatarURL: url })

                const file = fs.createWriteStream("./uploads/files.pdf");
                const request = https.get(url, function(response) {
                    response.pipe(file);
                });
            });
        })
    }
    changeAvatar = (req, res) => {
        try {
            const username = req.body.username
            console.log(username)
                // const username = req.username
            console.log(req.file)
            const avatar = req.file
            console.log(avatar.filename)
            const ext = avatar.filename.split(".")[1]
            console.log(ext)
            const filename = `${username}.${ext}`
            const filePath = `avatar/${filename}`
            var options = {
                destination: filePath,
            };
            firebase.bucket.upload(avatar.path, options, async(err, item) => {
                if (err) {
                    console.log(err)
                    return res.status(400).json({ success: false, message: 'ERROR' })
                }
                await User.updateOne({ username: username }, { $set: { avatar: filename } });
                return res.status(200).json({ success: true, message: 'Change avatar successfully' })
            })
        } catch (err) {
            console.log(err)
            return res.status(400).json({ success: false, message: 'ERROR' })

        }

    }
}

module.exports = new UserController()