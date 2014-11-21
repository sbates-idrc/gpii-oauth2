var bodyParser = require('body-parser');
var login = require('connect-ensure-login');
var crypto = require('crypto');
var express = require('express');
var exphbs  = require('express-handlebars');
var session = require('express-session');
var morgan = require('morgan');
var oauth2orize = require('oauth2orize');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var data = require('../gpii-oauth2-datastore');
var config = require('../config');
var utils = require('./utils');

function generateHandle() {
    // TODO ensure that handles cannot be guessed
    // TODO crypto.randomBytes can fail if there is not enough entropy
    // see http://nodejs.org/api/crypto.html
    return crypto.randomBytes(16).toString('hex');
}

function generateAuthCode () {
    return generateHandle();
}

function generateAccessToken() {
    return generateHandle();
}

// OAuth2orize server configuration
// --------------------------------

var server = oauth2orize.createServer();

server.serializeClient(function (client, done) {
    return done(null, client.id);
});

server.deserializeClient(function (id, done) {
    return done(null, data.findClientById(id));
});

server.grant(oauth2orize.grant.code(function (client, redirectUri, user, ares, done) {
    // Record the authorization decision if we haven't already
    var authDecision = data.findAuthDecision(user.id, client.id, redirectUri);
    if (!authDecision) {
        var accessToken = generateAccessToken();
        authDecision = data.saveAuthDecision(user.id, client.id, redirectUri, accessToken);
    }
    // Generate the authorization code and record it
    var code = generateAuthCode();
    data.saveAuthCode(authDecision.id, code);
    done(null, code);
}));

server.exchange(oauth2orize.exchange.code(function (client, code, redirectUri, done) {
    console.log('EXCHANGE CODE: client=' + JSON.stringify(client));
    console.log('EXCHANGE CODE: code=' + code);
    var auth = data.findAuthByCode(code);
    // TODO remove or flag an authCode after it is found to make single use
    if (!auth) {
        return done(null, false);
    }
    if (client.id !== auth.clientId) {
        return done(null, false);
    }
    if (redirectUri !== auth.redirectUri) {
        return done(null, false);
    }
    done(null, auth.accessToken);
}));

// Passport configuration
// ----------------------

passport.serializeUser(function (user, done) {
    return done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    return done(null, data.findUserById(id));
});

// To authenticate users
passport.use(new LocalStrategy(
    function (username, password, done) {
        var user = data.findUserByUsername(username);
        if (!user) {
            return done(null, false);
        }
        // TODO store passwords securely
        if (user.password !== password) {
            return done(null, false);
        }
        return done(null, user);
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
        var authDecision = data.findAuthDecision(userId, clientId, redirectUri);
        if (authDecision) {
            // The user has already authorized this request
            req.query['transaction_id'] = req.oauth2.transactionID;
            // TODO we can cache the server.decision middleware as it doesn't change for each request
            var middleware = server.decision();
            return utils.walkMiddleware(middleware, 0, req, res, next);
        } else {
            // Show the authorize page
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
