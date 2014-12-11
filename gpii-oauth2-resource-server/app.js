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
    components: {
        datastore: {
            type: "gpii.oauth2.datastoreWithSampleData" // variants here
        }
    },
    listeners: {
        onCreate: {
            listener: "gpii.oauth2.resourceServer.listenApp",
            args: ["{that}.expressApp", "{that}.datastore"]
        }
    }
});

gpii.oauth2.resourceServer.sendUnauthorized = function (res) {
    res.status(401);
    res.send("Unauthorized");
};

gpii.oauth2.resourceServer.listenApp = function (app, datastore) {
    app.get("/settings",
        function (req, res) {
            var accessToken = gpii.oauth2.parseBearerAuthorizationHeader(req);
            if (!accessToken) {
                // TODO integrate with Kettle error handling
                gpii.oauth2.resourceServer.sendUnauthorized(res);
            } else {
                var auth = datastore.findAuthByAccessToken(accessToken);
                if (!auth) {
                    // TODO integrate with Kettle error handling
                    gpii.oauth2.resourceServer.sendUnauthorized(res);
                } else {
                    res.send("PREFERENCES RESPONSE GOES HERE" +
                        " gpiiToken=" + auth.userGpiiToken +
                        " oauth2ClientId=" + auth.oauth2ClientId);
                }
            }
        }
    );
};
