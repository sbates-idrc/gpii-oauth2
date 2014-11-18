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
var config = require('../config');

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
    // TODO generate a code and record it
    var code = 'code_1';
    done(null, code);
}));

server.exchange(oauth2orize.exchange.code(function (client, code, redirectUri, done) {
    console.log('client=' + JSON.stringify(client));
    // TODO generate an access token and record it
    var accessToken = 'access_token_1';
    done(null, accessToken);
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
        // TODO salt and hash the passwords
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
        console.log('client_id=' + clientId);
        console.log('client_secret=' + clientSecret);
        return done(null, data.findClientById(1));
    }
));

// Express configuration
// ---------------------

// TODO in Express 3, what are the semantics of middleware and route ordering?

var app = express();
app.use(morgan(':method :url', { immediate: true }));
app.use(bodyParser.urlencoded({ extended: true }));
// OAuth2orize requires session support
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
    function (req, res) {
        res.render('authorize', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
    }
);

app.post('/authorize_decision',
    login.ensureLoggedIn('/login'),
    server.decision()
);

app.post('/access_token',
    passport.authenticate('oauth2-client-password', { session: false }),
    server.token()
);

app.listen(config.authorizationServerPort);
