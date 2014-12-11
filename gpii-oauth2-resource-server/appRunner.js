// TODO rename this file to app.js once we have src/ResourceServer.js

"use strict";

var config = require("../config");

var fluid = require("infusion");
require("./app.js");
var gpii = fluid.registerNamespace("gpii");

var server = gpii.oauth2.resourceServer();
// TODO replace the line below with: server.expressApp.listen(server.options.port);
server.expressApp.listen(config.resourceServerPort);
