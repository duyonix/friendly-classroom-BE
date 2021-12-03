const authorizeRoute = require('./authorize.route.js');
const userRoute = require('./user.route');
const postRoute = require('./post.route');
const auth = require('../middleware/auth');

function route(app) {
  app.use('/api/authorize', authorizeRoute);
  app.use('/api/user', userRoute);

  app.use('/api/post', auth, postRoute);
}

module.exports = route;
