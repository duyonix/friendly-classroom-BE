const authorizeRoute = require('./authorize.route.js');
const userRoute = require('./user.route');
const documentRoute = require('./document.route')

function route(app) {
    app.use('/api/authorize', authorizeRoute);
    app.use('/api/user', userRoute);

    app.use('/api/document', documentRoute)
}

module.exports = route;