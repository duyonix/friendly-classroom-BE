const authorizeRoute = require('./authorize.route.js');
const userRoute = require('./user.route');
const documentRoute = require('./document.route');
const homeworkRoute = require('./homework.route')
const postRoute = require('./posts.route');
const auth = require('../middleware/auth');
const classroomRoute = require('./classroom.route');
const commentRoute = require('./comment.route');
const accessClassroom = require('../middleware/accessClassroom');

const classroomController = require('../controllers/ClassroomController');

function route(app) {
    app.use('/api/authorize', authorizeRoute);
    app.use('/api/user', userRoute);
    app.use('/api/document', documentRoute);
    app.use('/api/homework', homeworkRoute)

    app.put('api/classroom/join', auth, classroomController.join);
    app.post('api/classroom/create', auth, classroomController.create);

    app.use('/api/:classroomId/post', auth, postRoute);
    app.use('/api/:classroomId/:postId/comment', auth, commentRoute);
    app.use('/api/:classroomId', auth, accessClassroom, classroomRoute);


}

module.exports = route;