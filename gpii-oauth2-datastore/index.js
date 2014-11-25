var _ = require('lodash');
var util = require('util');
var config = require('../config');

var users = [
    { id: 1, username: 'alice', password: 'a' },
    { id: 2, username: 'bob', password: 'b' }
];

var clients = [
    {
        id: 1,
        name: 'Service A',
        oauth2ClientId: 'client_id_1',
        oauth2ClientSecret: 'client_secret_1',
        redirectUri: util.format('http://localhost:%d/authorize_callback', config.clientPort)
    },
    {
        id: 2,
        name: 'Service Passport Client',
        oauth2ClientId: 'client_id_pp',
        oauth2ClientSecret: 'client_secret_pp',
        redirectUri: util.format('http://localhost:%d/authorize_callback', config.passportClientPort)
    }
];

// Users
// -----

exports.findUserById = function (id) {
    return _.find(users, function (user) { return user.id === id; });
};

exports.findUserByUsername = function (username) {
    return _.find(users, function (user) { return user.username === username; } );
};

// Clients
// -------

var findClientById = function (id) {
    return _.find(clients, function (client) { return client.id === id; });
};

exports.findClientById = findClientById;

exports.findClientByOauth2ClientId = function (oauth2ClientId) {
    return _.find(clients, function (client) { return client.oauth2ClientId === oauth2ClientId; });
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
        accessToken: accessToken,
        removed: false
    };
    authDecisions.push(authDecision);
    console.log("SAVE AUTH DECISION: id=" + authDecisionId);
    console.log(JSON.stringify(authDecisions, null, 4));
    return authDecision;
};

function findAuthDecisionById (id) {
    return _.find(authDecisions, function (ad) {
        return ad.id === id && ad.removed === false;
    });
}

exports.findAuthDecision = function (userId, clientId, redirectUri) {
    return _.find(authDecisions, function (ad) {
        return ad.userId === userId
            && ad.clientId === clientId
            && ad.redirectUri === redirectUri
            && ad.removed === false;
    });
};

exports.removeAuthDecisionId = function (userId, authDecisionId) {
    // Only remove the authorization with authDecisionId if it is owned
    // by userId so that users cannot delete authorizations owned by others
    var authDecision = findAuthDecisionById(authDecisionId);
    if (authDecision && authDecision.userId === userId) {
        authDecision.removed = true;
    }
    console.log("REMOVE AUTH DECISION: id=" + authDecisionId);
    console.log(JSON.stringify(authDecisions, null, 4));
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
    console.log("SAVE AUTH CODE: code=" + code);
    console.log(JSON.stringify(authCodes, null, 4));
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

// Authorization Decision join Client
// ----------------------------------

exports.findAuthorizedClientsByUserId = function (userId) {
    var userAuthDecisions = _.filter(authDecisions, function (ad) {
        return ad.userId === userId && ad.removed === false;
    });
    // TODO when move to CouchDB, do join there, rather than by hand
    var authorizedClients = [];
    userAuthDecisions.forEach(function (ad) {
        var client = findClientById(ad.clientId);
        if (client) {
            authorizedClients.push({
                authDecisionId: ad.id,
                clientName: client.name
            });
        }
    });
    return authorizedClients;
};
