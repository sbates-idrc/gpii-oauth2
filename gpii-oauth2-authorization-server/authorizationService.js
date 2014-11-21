var crypto = require('crypto');

function generateHandle() {
    // TODO ensure that handles cannot be guessed
    // TODO crypto.randomBytes can fail if there is not enough entropy
    // see http://nodejs.org/api/crypto.html
    return crypto.randomBytes(16).toString('hex');
}

function generateAuthCode () {
    return generateHandle();
}

function generateAccessToken() {
    return generateHandle();
}

module.exports = function (data) {

    var grantAuthorizationCode = function (userId, clientId, redirectUri) {
        // Record the authorization decision if we haven't already
        var authDecision = data.findAuthDecision(userId, clientId, redirectUri);
        if (!authDecision) {
            var accessToken = generateAccessToken();
            authDecision = data.saveAuthDecision(userId, clientId, redirectUri, accessToken);
        }
        // Generate the authorization code and record it
        var code = generateAuthCode();
        data.saveAuthCode(authDecision.id, code);
        return code;
    };

    var userHasAuthorized = function (userId, clientId, redirectUri) {
        return data.findAuthDecision(userId, clientId, redirectUri) ? true : false;
    };

    var exchangeCodeForAccessToken = function (code, clientId, redirectUri) {
        var auth = data.findAuthByCode(code);
        // TODO remove or flag an authCode after it is found to make single use
        if (auth && auth.clientId === clientId && auth.redirectUri === redirectUri) {
            return auth.accessToken;
        } else {
            return false;
        }
    };

    var getAuthorizedClientsForUser = function (userId) {
        return data.findAuthorizedClientsByUserId(userId);
    };

    var removeAuthorization = function (userId, authDecisionId) {
        data.removeAuthDecisionId(userId, authDecisionId);
    }

    return {
        grantAuthorizationCode: grantAuthorizationCode,
        userHasAuthorized: userHasAuthorized,
        exchangeCodeForAccessToken: exchangeCodeForAccessToken,
        getAuthorizedClientsForUser: getAuthorizedClientsForUser,
        removeAuthorization: removeAuthorization
    };
    
};
