var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.oauth2");

fluid.defaults("gpii.oauth2.clientService", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    components: {
        datastore: {
            type: "gpii.oauth2.datastore"
        }
    },
    invokers: {
        authenticateClient: {
            funcName: "gpii.oauth2.clientService.authenticateClient",
            args: ["{datastore}", "{arguments}.0", "{arguments}.1"]
            //                    oauth2ClientId, oauth2ClientSecret
        },
        checkClientRedirectUri: {
            funcName: "gpii.oauth2.clientService.checkClientRedirectUri",
            args: ["{datastore}", "{arguments}.0", "{arguments}.1"]
            //                    oauth2ClientId, redirectUri
        },
        getClientById: {
            func: "{datastore}.findClientById"
        }
    }
});

gpii.oauth2.clientService.authenticateClient = function (datastore, oauth2ClientId, oauth2ClientSecret) {
    var client = datastore.findClientByOauth2ClientId(oauth2ClientId);
    if (client && client.oauth2ClientSecret === oauth2ClientSecret) {
        return client;
    }
    return false;
};

gpii.oauth2.clientService.checkClientRedirectUri = function (datastore, oauth2ClientId, redirectUri) {
    var client = datastore.findClientByOauth2ClientId(oauth2ClientId);
    if (client && client.redirectUri === redirectUri) {
        return client;
    }
    return false;
};
