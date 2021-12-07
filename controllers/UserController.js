const User = require("../models/User")
const firebase = require('../firebase')
const mongoose = require('mongoose')

class UserController {
    getInformation = (req, res) => {
        try {
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
        } catch (err) {
            console.log(err)
        }

    }
    changeAvatar = (req, res) => {
        try {
            const username = req.username
            const avatar = req.file
            const ext = avatar.filename.split(".")[1]
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