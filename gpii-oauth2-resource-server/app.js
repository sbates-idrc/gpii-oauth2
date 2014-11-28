var express = require('express');
var morgan = require('morgan');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;

var fluid = fluid || require("infusion");
require('../gpii-oauth2-datastore');
var gpii = fluid.registerNamespace("gpii");
var data = gpii.oauth2.datastore.createDatastore();
var config = require('../config');

// Used to check the accessToken on protected APIs
passport.use(new BearerStrategy(
    function (accessToken, done) {
        // TODO check the accessToken and find the associated user
        console.log('access_token=' + accessToken);
        return done(null, data.findUserById(1));
    }
));

var app = express();
app.use(morgan(':method :url', { immediate: true }));
app.use(passport.initialize());

app.get('/preferences',
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        res.send('PREFERENCES RESPONSE GOES HERE');
    }
);

app.listen(config.resourceServerPort);
