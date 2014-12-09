"use strict";

var express = require("express");
var morgan = require("morgan");

var fluid = fluid || require("infusion");
require("../oauth2Utilities");
var gpii = fluid.registerNamespace("gpii");
var config = require("../config");

var app = express();
app.use(morgan(":method :url", { immediate: true }));

app.get("/settings",
    function (req, res) {
        var accessToken = gpii.oauth2.parseBearerAuthorizationHeader(req);
        // TODO check accessToken
        console.log("access_token=" + accessToken);
        res.send("PREFERENCES RESPONSE GOES HERE");
    }
);

app.listen(config.resourceServerPort);
