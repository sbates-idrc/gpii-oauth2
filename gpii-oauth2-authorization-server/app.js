var bodyParser = require('body-parser');
var login = require('connect-ensure-login');
var express = require('express');
var exphbs  = require('express-handlebars');
var session = require('express-session');
var morgan = require('morgan');
var oauth2orize = require('oauth2orize');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var data = require('../gpii-oauth2-datastore');
var authorizationService = require('./authorizationService')(data);
var clientService = require('./clientService')(data);
var userService = require('./userService')(data);
var utils = require('./utils');
var config = require('../config');

// OAuth2orize server configuration
// --------------------------------

var server = oauth2orize.createServer();

server.serializeClient(function (client, done) {
    return done(null, client.id);
});

server.deserializeClient(function (id, done) {
    return done(null, clientService.getClientById(id));
});

server.grant(oauth2orize.grant.code(function (client, redirectUri, user, ares, done) {
    return done(null, authorizationService.grantAuthorizationCode(user.id, client.id, redirectUri));
}));

server.exchange(oauth2orize.exchange.code(function (client, code, redirectUri, done) {
    return done(null, authorizationService.exchangeCodeForAccessToken(code, client.id, redirectUri));
}));

// Passport configuration
// ----------------------

passport.serializeUser(function (user, done) {
    return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    return done(null, userService.getUserById(id));
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        return done(null, userService.authenticateUser(username, password));
    }
));

// Used to verify the (client_id, client_secret) pair.
// ClientPasswordStrategy reads the client_id and client_secret from
// the request body. Can also use a BasicStrategy for HTTP Basic authentication.
passport.use(new ClientPasswordStrategy(
    function (clientId, clientSecret, done) {
        // TODO verify that the clientSecret matches what we have
        // registered for the clientId
        console.log('CLIENT PASSWORD STRATEGY: client_id=' + clientId);
        console.log('CLIENT PASSWORD STRATEGY: client_secret=' + clientSecret);
        return done(null, data.findClientById(1));
    }
));

// Express configuration
// ---------------------

// TODO in Express 3, what are the semantics of middleware and route ordering?

var app = express();
app.use(morgan(':method :url', { immediate: true }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({secret: 'some secret'}));
app.use(passport.initialize());
app.use(passport.session());
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.get('/login', function(req, res) {
    res.render('login');
});

app.post('/login',
    passport.authenticate('local', { successReturnToOrRedirect: '/', failureRedirect: '/login' })
);

app.get('/authorize',
    login.ensureLoggedIn('/login'),
    server.authorize(function (clientId, redirectUri, done) {
        // TODO look up the client in our records and check the
        // redirectUri against the one registered for that client
        done(null, data.findClientById(1), redirectUri);
    }),
    function (req, res, next) {
        var userId = req.user.id;
        var clientId = req.oauth2.client.id;
        var redirectUri = req.oauth2.redirectURI;
        if (authorizationService.userHasAuthorized(userId, clientId, redirectUri)) {
            // The user has previously authorized so we can grant a code without asking them
            req.query['transaction_id'] = req.oauth2.transactionID;
            // TODO we can cache the server.decision middleware as it doesn't change for each request
            var middleware = server.decision();
            return utils.walkMiddleware(middleware, 0, req, res, next);
        } else {
            // otherwise, show the authorize page
            res.render('authorize', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
        }
    }
);

app.post('/authorize_decision',
    login.ensureLoggedIn('/login'),
    server.decision()
);

app.get('/privacy',
    login.ensureLoggedIn('/login'),
    function (req, res) {
        var userId = req.user.id;
        var authorizedClients = data.findAuthorizedClientsByUserId(userId);
        // Build view objects
        var services = [];
        authorizedClients.forEach(function (client) {
            services.push({
                serviceName: client.clientName,
                authDecisionId: client.authDecisionId
            });
        });
        res.render('privacy', { user: req.user, authorizedServices: services });
    }
);

app.post('/remove_authorization',
    login.ensureLoggedIn('/login'),
    function (req, res) {
        var userId = req.user.id;
        var authDecisionId = parseInt(req.body.remove, 10);
        console.log("REMOVE AUTHORIZATION: " + authDecisionId);
        data.removeAuthDecisionId(userId, authDecisionId);
        res.redirect('/privacy');
    }
);

app.post('/access_token',
    passport.authenticate('oauth2-client-password', { session: false }),
    server.token()
);

app.listen(config.authorizationServerPort);
