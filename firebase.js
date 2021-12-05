const admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    storageBucket: 'gs://friendlyclassroombe.appspot.com'
})

const bucket = admin.storage().bucket()
    // console.log(bucket)
module.exports = {
    bucket
}