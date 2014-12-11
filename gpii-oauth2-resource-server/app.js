"use strict";

var fluid = require("infusion");
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
    app.get("/settings",
        function (req, res) {
            var accessToken = gpii.oauth2.parseBearerAuthorizationHeader(req);
            // TODO check accessToken and retrieve user and solution info
            console.log("access_token=" + accessToken);
            res.send("PREFERENCES RESPONSE GOES HERE");
        }
    );
};
