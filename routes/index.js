const authorizeRoute = require('./authorize.route.js');
const userRoute = require('./user.route');
const postRoute = require('./posts.route');
const auth = require('../middleware/auth');
const classroomRoute = require('./classroom.route');

function route(app) {
  app.use('/api/authorize', authorizeRoute);
  app.use('/api/user', userRoute);
  app.use('/api/:classroomId/posts', auth, postRoute);
  app.use('/api/classroom', classroomRoute);
}

module.exports = route;
