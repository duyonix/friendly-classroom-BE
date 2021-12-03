const authorizeRoute = require('./authorize.route.js');
const userRoute = require('./user.route');
const documentRoute = require('./document.route')
const postRoute = require('./post.route');
const auth = require('../middleware/auth');

function route(app) {
    app.use('/api/authorize', authorizeRoute);
    app.use('/api/user', userRoute);

    app.use('/api/document', documentRoute)
    app.use('/api/post', auth, postRoute);
}

module.exports = route;