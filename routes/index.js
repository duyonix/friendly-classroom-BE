const authorizeRoute = require('./authorize.route.js');
const userRoute = require('./user.route');

function route(app) {
  app.use('/api/authorize', authorizeRoute);
  app.use('/api/user', userRoute);
}

module.exports = route;
