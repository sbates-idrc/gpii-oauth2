var _ = require('lodash');

var users = [
    { id: 1, username: 'alice', password: 'a' },
    { id: 2, username: 'bob', password: 'b' }
];

var clients = [
    { id: 1, name: 'client_1', clientId: 'client_id_1', clientSecret: 'client_secret_1' }
];

// Users
// -----

exports.findUserById = function (id) {
    return _.find(users, function (user) { return user.id === id });
};

exports.findUserByUsername = function (username) {
    return _.find(users, function (user) { return user.username === username} );
};

// Clients
// -------

exports.findClientById = function (id) {
    return _.find(clients, function (client) { return client.id === id });
};

// Authorization Decisions
// -----------------------

// TODO in this implementation, there is a one-to-one correspondence between
// recorded user 'authorization decisions' and access tokens. We may want to
// rethink this and give them different lifetimes.

var authDesicionsIdSeq = 1;
var authDecisions = [];

exports.saveAuthDecision = function (userId, clientId, redirectUri, accessToken) {
    var authDecisionId = authDesicionsIdSeq;
    ++authDesicionsIdSeq;
    var authDecision = {
        id: authDecisionId, // primary key
        userId: userId, // foreign key
        clientId: clientId, // foreign key
        redirectUri: redirectUri,
        accessToken: accessToken
    };
    authDecisions.push(authDecision);
    return authDecision;
};

function findAuthDecisionById (id) {
    return _.find(authDecisions, function (ad) { return ad.id === id });
};

exports.findAuthDecision = function (userId, clientId, redirectUri) {
    return _.find(authDecisions, function (ad) {
        return ad.userId === userId
            && ad.clientId === clientId
            && ad.redirectUri === redirectUri;
    });
};

// Authorization Codes
// -------------------

// TODO make authCodes active only for a limited period of time
// TODO make authCodes single use

var authCodes = [];

exports.saveAuthCode = function (authDecisionId, code) {
    authCodes.push({
        authDecisionId: authDecisionId, // foreign key
        code: code
    });
};

// Authorization Decision join Authorization Code
// ----------------------------------------------

exports.findAuthByCode = function (code) {
    var authCode = _.find(authCodes, function (ac) { return ac.code === code });
    if (!authCode) {
        return authCode;
    }
    // TODO when move to CouchDB, do join there, rather than by hand
    var authDecision = findAuthDecisionById(authCode.authDecisionId);
    if (!authDecision) {
        return authDecision;
    }
    return ({
        clientId: authDecision.clientId,
        redirectUri: authDecision.redirectUri,
        accessToken: authDecision.accessToken
    });
};
