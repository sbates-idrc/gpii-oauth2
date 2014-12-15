"use strict";

var morgan = require("morgan");

var fluid = require("infusion");
require("../../gpii-oauth2-datastore");
require("../../gpii-oauth2-utilities");
require("../../gpii-oauth2-authorization-server");
require("../../gpii-oauth2-resource-server");

var gpii = fluid.registerNamespace("gpii");

fluid.defaults("gpii.oauth2.integratedServerOptions", {
    gradeNames: ["fluid.littleComponent", "autoInit"],
    members: {
        expressApp: "{gpii.oauth2.integratedServer}.expressApp"
    },
    components: {
        dataStore: "{gpii.oauth2.integratedServer}.dataStore"
    }
});

fluid.defaults("gpii.oauth2.integratedServer", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    members: {
        expressApp: {
            expander: {
                func: "gpii.oauth2.createExpressApp"
            }
        }
    },
    components: {
        dataStore: {
            type: "gpii.oauth2.dataStoreWithSampleData"
        },
        authServer: {
            type: "gpii.oauth2.authServer",
            createOnEvent: "expressReady",
            options: {
                gradeNames: ["gpii.oauth2.integratedServerOptions"]
            }
        },
        resourceServer: {
            type: "gpii.oauth2.resourceServer",
            createOnEvent: "expressReady",
            options: {
                gradeNames: ["gpii.oauth2.integratedServerOptions"]
            }
        }
    },
    events: {
        expressReady: null
    },
    listeners: {
        onCreate: {
            listener: "gpii.oauth2.integratedServer.listenApp",
            args: ["{that}"]
        }
    }
});

gpii.oauth2.integratedServer.listenApp = function (that) {
    that.expressApp.use(morgan(":method :url", { immediate: true }));
    that.events.expressReady.fire();
};
