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

var utils = require('./utils');
var config = require('../config'); // TODO: export up to options in gpii.oauth2.authServer

var fluid = require("infusion");
require('../gpii-oauth2-datastore');
require('./userService');
require('./authorizationService');
require('./clientService');

var gpii = fluid.registerNamespace("gpii");

// gpii.oauth2.oauth2orizeServer
// -----------------------------

gpii.oauth2.createOauth2orizeServer = function () {
    return oauth2orize.createServer();
};

// Unbound references: {clientService} and {authorizationService}
fluid.defaults("gpii.oauth2.oauth2orizeServer", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    members: {
        oauth2orizeServer: {
            expander: {
                func: "gpii.oauth2.createOauth2orizeServer"
            }
        }
    },
    listeners: {
        onCreate: {
            listener: "gpii.oauth2.oauth2orizeServer.listenOauth2orize",
            args: ["{that}.oauth2orizeServer", "{clientService}", "{authorizationService}"]
        }
    }
});

// TODO what name here?
gpii.oauth2.oauth2orizeServer.listenOauth2orize = function (oauth2orizeServer, clientService, authorizationService) {
    oauth2orizeServer.serializeClient(function (client, done) {
        return done(null, client.id);
    });
    
    oauth2orizeServer.deserializeClient(function (id, done) {
        return done(null, clientService.getClientById(id));
    });
    
    oauth2orizeServer.grant(oauth2orize.grant.code(function (client, redirectUri, user, ares, done) {
        return done(null, authorizationService.grantAuthorizationCode(user.id, client.id, redirectUri));
    }));
    
    oauth2orizeServer.exchange(oauth2orize.exchange.code(function (client, code, redirectUri, done) {
        return done(null, authorizationService.exchangeCodeForAccessToken(code, client.id, redirectUri));
    }));
};

// gpii.oauth2.passport
// --------------------

gpii.oauth2.createPassport = function () {
    return passport; // passport is apparently a singleton - but we will behave as if it isn't
};

// TODO: This is just a wrapper of the apparently static result of require("passport") under the pretence
// that this call is instance-forming - instead this appears to produce a node-global repository of state

fluid.defaults("gpii.oauth2.passport", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    members: {
        passport: {
            expander: {
                func: "gpii.oauth2.createPassport"
            }
        }
    },
    listeners: {
        onCreate: {
            listener: "gpii.oauth2.passport.listenPassport",
            args: ["{that}.passport", "{userService}", "{clientService}"]
        }
    }
});

// TODO what name here?
gpii.oauth2.passport.listenPassport = function (passport, userService, clientService) {
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
    
    // ClientPasswordStrategy reads the client_id and client_secret from the
    // request body. Can also use a BasicStrategy for HTTP Basic authentication.
    passport.use(new ClientPasswordStrategy(
        function (oauth2ClientId, oauth2ClientSecret, done) {
            return done(null, clientService.authenticateClient(oauth2ClientId, oauth2ClientSecret));
        }
    ));
};

// gpii.oauth2.authServer
// ----------------------

gpii.oauth2.createExpressApp = function () {
    return express();
};

// An empty grade to guide resolution of IoC expressions onto a suitable gpii.oauth2.datastore
fluid.defaults("gpii.oauth2.datastoreHolder", {
   gradeNames: ["fluid.eventedComponent", "autoInit"]
});

fluid.defaults("gpii.oauth2.authServer", {
    gradeNames: ["fluid.eventedComponent", "gpii.oauth2.datastoreHolder", "autoInit"],
    members: {
        expressApp: {
            expander: {
                func: "gpii.oauth2.createExpressApp"
            }
        }
    },
    components: {
        oauth2orizeServer: {
            type: "gpii.oauth2.oauth2orizeServer",
        },
        passport: {
            type: "gpii.oauth2.passport"
        },
        dataStore: {
            type: "gpii.oauth2.datastore" // variants here
        },
        authorizationService: {
            type: "gpii.oauth2.authorizationService",
            options: {
                components: {
                    dataStore: "{gpii.oauth2.datastoreHolder}.dataStore"
                }
            }
        },
        clientService: {
            type: "gpii.oauth2.clientService",
            options: {
                components: {
                    dataStore: "{gpii.oauth2.datastoreHolder}.dataStore"
                }
            }
        },
        userService: {
            type: "gpii.oauth2.userService",
            options: {
                components: {
                    dataStore: "{gpii.oauth2.datastoreHolder}.dataStore"
                }
            }
        },
    },
    listeners: {
        onCreate: {
            listener: "gpii.oauth2.authServer.listenApp",
            args: ["{that}.expressApp", "{that}.oauth2orizeServer.oauth2orizeServer", 
                "{that}.clientService", "{that}.authorizationService", "{that}.passport.passport"]
        }
    }
});

gpii.oauth2.authServer.listenApp = function (app, oauth2orizeServer, clientService, authorizationService, passport) {

    // TODO in Express 3, what are the semantics of middleware and route ordering?

    app.use(morgan(':method :url', { immediate: true }));
    app.use(bodyParser.urlencoded({ extended: true }));
    // TODO move the secret to configuration
    app.use(session({ name: 'auth_server_connect.sid', secret: 'some secret' }));
    app.use(passport.initialize()); // TODO: warning, dependency risk
    app.use(passport.session()); // TODO: warning, dependency risk
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
        oauth2orizeServer.authorize(function (oauth2ClientId, redirectUri, done) {
            done(null, clientService.checkClientRedirectUri(oauth2ClientId, redirectUri), redirectUri);
        }),
        function (req, res, next) {
            var userId = req.user.id;
            var clientId = req.oauth2.client.id;
            var redirectUri = req.oauth2.redirectURI;
            if (authorizationService.userHasAuthorized(userId, clientId, redirectUri)) {
                // The user has previously authorized so we can grant a code without asking them
                req.query['transaction_id'] = req.oauth2.transactionID;
                // TODO we can cache the oauth2orizeServer.decision middleware as it doesn't change for each request
                var middleware = oauth2orizeServer.decision();
                return utils.walkMiddleware(middleware, 0, req, res, next);
            } else {
                // otherwise, show the authorize page
                res.render('authorize', { transactionID: req.oauth2.transactionID, user: req.user, client: req.oauth2.client });
            }
        }
    );
    
    app.post('/authorize_decision',
        login.ensureLoggedIn('/login'),
        oauth2orizeServer.decision()
    );
    
    app.get('/privacy',
        login.ensureLoggedIn('/login'),
        function (req, res) {
            var authorizedClients = authorizationService.getAuthorizedClientsForUser(req.user.id);
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
            authorizationService.revokeAuthorization(userId, authDecisionId);
            res.redirect('/privacy');
        }
    );
    
    app.post('/access_token',
        passport.authenticate('oauth2-client-password', { session: false }),
        oauth2orizeServer.token()
    );
};

// Top-level driver
// ----------------

var server = gpii.oauth2.authServer();
// TODO replace the line below with: server.expressApp.listen(server.options.port);
server.expressApp.listen(config.authorizationServerPort);
