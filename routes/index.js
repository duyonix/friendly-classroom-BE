const authorizeRoute = require('./authorize.route.js');
const userRoute = require('./user.route');
const documentRoute = require('./document.route');
const postRoute = require('./posts.route');
const auth = require('../middleware/auth');
const classroomRoute = require('./classroom.route');
const commentRoute = require('./comment.route');

function route(app) {
    app.use('/api/authorize', authorizeRoute);
    app.use('/api/user', userRoute);
    app.use('/api/:classroomId/posts', auth, postRoute);
    app.use('/api/:classroomId/:postId', auth, commentRoute);
    app.use('/api/classroom', auth, classroomRoute);

    app.use('/api/document', documentRoute);
}

module.exports = route;
