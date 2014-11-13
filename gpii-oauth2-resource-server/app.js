var express = require('express');
var morgan = require('morgan');
var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var config = require('../config');

function getUser () {
    return { id: 1, name: 'Some User' };
}

// Used to check the accessToken on protected APIs
passport.use(new BearerStrategy(
    function (accessToken, done) {
        // here we would check the accessToken and find the associated user
        console.log('access_token=' + accessToken);
        return done(null, getUser());
    }
));

var app = express();
app.use(morgan(':method :url', { immediate: true }));
app.use(passport.initialize());

app.get('/preferences',
    passport.authenticate('bearer', { session: false }),
    function (req, res) {
        res.send('hello world');
    }
);

app.listen(config.resourceServerPort);
