var fluid = require("infusion");
var crypto = require('crypto');

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.oauth2");

fluid.defaults("gpii.oauth2.authorizationService", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    components: {
        datastore: {
            type: "gpii.oauth2.datastore"
        }
    },
    invokers: {
        grantAuthorizationCode: {
            funcName: "gpii.oauth2.authorizationService.grantAuthorizationCode",
            args: ["{datastore}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            //                    userId, clientId, redirectUri
        },
        userHasAuthorized: {
            funcName: "gpii.oauth2.authorizationService.userHasAuthorized",
            args: ["{datastore}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            //                    userId, clientId, redirectUri
        },
        exchangeCodeForAccessToken: {
            funcName: "gpii.oauth2.authorizationService.exchangeCodeForAccessToken",
            args: ["{datastore}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            //                    code, clientId, redirectUri
        },
        getAuthorizedClientsForUser: {
            func: "{datastore}.findAuthorizedClientsByUserId"
        },
        revokeAuthorization: {
            func: "{datastore}.revokeAuthDecision"
        }
    }
});

gpii.oauth2.authorizationService.generateHandle = function () {
    // TODO ensure that handles cannot be guessed
    // TODO crypto.randomBytes can fail if there is not enough entropy
    // see http://nodejs.org/api/crypto.html
    return crypto.randomBytes(16).toString('hex');
}

gpii.oauth2.authorizationService.generateAuthCode = function () {
    return gpii.oauth2.authorizationService.generateHandle();
}

gpii.oauth2.authorizationService.generateAccessToken = function () {
    return gpii.oauth2.authorizationService.generateHandle();
}

gpii.oauth2.authorizationService.grantAuthorizationCode = function (datastore, userId, clientId, redirectUri) {
    // Record the authorization decision if we haven't already
    var authDecision = datastore.findAuthDecision(userId, clientId, redirectUri);
    if (!authDecision) {
        var accessToken = gpii.oauth2.authorizationService.generateAccessToken();
        authDecision = datastore.saveAuthDecision(userId, clientId, redirectUri, accessToken);
    }
    // Generate the authorization code and record it
    var code = gpii.oauth2.authorizationService.generateAuthCode();
    datastore.saveAuthCode(authDecision.id, code);
    return code;
};

gpii.oauth2.authorizationService.userHasAuthorized = function (datastore, userId, clientId, redirectUri) {
    return datastore.findAuthDecision(userId, clientId, redirectUri) ? true : false;
};

gpii.oauth2.authorizationService.exchangeCodeForAccessToken = function (datastore, code, clientId, redirectUri) {
    var auth = datastore.findAuthByCode(code);
    // TODO flag an authCode after it is found to make single use
    if (auth && auth.clientId === clientId && auth.redirectUri === redirectUri) {
        return auth.accessToken;
    } else {
        return false;
    }
};
