module.exports = function (data) {

    var authenticateClient = function (oauth2ClientId, oauth2ClientSecret) {
        var client = data.findClientByOauth2ClientId(oauth2ClientId);
        if (client && client.oauth2ClientSecret === oauth2ClientSecret) {
            return client;
        }
        return false;
    };

    var checkClientRedirectUri = function (oauth2ClientId, redirectUri) {
        var client = data.findClientByOauth2ClientId(oauth2ClientId);
        if (client && client.redirectUri === redirectUri) {
            return client;
        }
        return false;
    };

    var getClientById = function (clientId) {
        return data.findClientById(clientId);
    };

    return {
        authenticateClient: authenticateClient,
        checkClientRedirectUri: checkClientRedirectUri,
        getClientById: getClientById
    };

};
