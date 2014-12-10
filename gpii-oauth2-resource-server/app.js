"use strict";

var morgan = require("morgan");
var config = require("../config");

var fluid = fluid || require("infusion");
require("../oauth2Utilities");
var gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.oauth2.resourceServer", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    members: {
        expressApp: {
            expander: {
                func: "gpii.oauth2.createExpressApp"
            }
        }
    },
    listeners: {
        onCreate: {
            listener: "gpii.oauth2.resourceServer.listenApp",
            args: ["{that}.expressApp"]
        }
    }
});

gpii.oauth2.resourceServer.listenApp = function (app) {
    app.use(morgan(":method :url", { immediate: true }));

    app.get("/settings",
        function (req, res) {
            var accessToken = gpii.oauth2.parseBearerAuthorizationHeader(req);
            // TODO check accessToken
            console.log("access_token=" + accessToken);
            res.send("PREFERENCES RESPONSE GOES HERE");
        }
    );
};

// Top-level driver
// ----------------

var server = gpii.oauth2.resourceServer();
// TODO replace the line below with: server.expressApp.listen(server.options.port);
server.expressApp.listen(config.resourceServerPort);
