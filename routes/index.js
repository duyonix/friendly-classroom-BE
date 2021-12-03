const authorizeRoute = require('./authorize.route.js');
const userRoute = require('./user.route');
<<<<<<< HEAD
const documentRoute = require('./document.route')

function route(app) {
    app.use('/api/authorize', authorizeRoute);
    app.use('/api/user', userRoute);

    app.use('/api/document', documentRoute)
=======
const postRoute = require('./post.route');
const auth = require('../middleware/auth');

function route(app) {
  app.use('/api/authorize', authorizeRoute);
  app.use('/api/user', userRoute);

  app.use('/api/post', auth, postRoute);
>>>>>>> d0b46e002a706a0cc02e2ef1e03fa2ce666dbaa6
}

module.exports = route;