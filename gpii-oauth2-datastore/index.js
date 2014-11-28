var fluid = fluid || require("infusion");
var _ = require('lodash');
var util = require('util');
var config = require('../config');

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.oauth2.datastore");

gpii.oauth2.datastore.createDatastore = function () {

    var that = {};

    that.users = [
        { id: 1, username: 'alice', password: 'a' },
        { id: 2, username: 'bob', password: 'b' }
    ];

    that.clients = [
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

    that.authDecisionsIdSeq = 1;
    that.authDecisions = [];
    that.authCodes = [];

    // Users
    // -----

    that.findUserById = function (id) {
        return _.find(that.users, function (user) { return user.id === id; });
    };

    that.findUserByUsername = function (username) {
        return _.find(that.users, function (user) { return user.username === username; } );
    };

    // Clients
    // -------

    that.findClientById = function (id) {
        return _.find(that.clients, function (client) { return client.id === id; });
    };

    that.findClientByOauth2ClientId = function (oauth2ClientId) {
        return _.find(that.clients, function (client) { return client.oauth2ClientId === oauth2ClientId; });
    };

    // Authorization Decisions
    // -----------------------

    // TODO in this implementation, there is a one-to-one correspondence between
    // recorded user 'authorization decisions' and access tokens. We may want to
    // rethink this and give them different lifetimes.

    that.saveAuthDecision = function (userId, clientId, redirectUri, accessToken) {
        var authDecisionId = that.authDecisionsIdSeq;
        that.authDecisionsIdSeq = that.authDecisionsIdSeq + 1;
        var authDecision = {
            id: authDecisionId, // primary key
            userId: userId, // foreign key
            clientId: clientId, // foreign key
            redirectUri: redirectUri,
            accessToken: accessToken,
            revoked: false
        };
        that.authDecisions.push(authDecision);
        console.log("SAVE AUTH DECISION: id=" + authDecisionId);
        console.log(JSON.stringify(that.authDecisions, null, 4));
        return authDecision;
    };

    that.findAuthDecisionById = function (id) {
        return _.find(that.authDecisions, function (ad) {
            return ad.id === id && ad.revoked === false;
        });
    }

    that.findAuthDecision = function (userId, clientId, redirectUri) {
        return _.find(that.authDecisions, function (ad) {
            return ad.userId === userId
                && ad.clientId === clientId
                && ad.redirectUri === redirectUri
                && ad.revoked === false;
        });
    };

    that.revokeAuthDecision = function (userId, authDecisionId) {
        // Only revoke the authorization with authDecisionId if it is owned
        // by userId so that users cannot revoke authorizations owned by others
        var authDecision = that.findAuthDecisionById(authDecisionId);
        if (authDecision && authDecision.userId === userId) {
            authDecision.revoked = true;
        }
        console.log("REVOKE AUTH DECISION: id=" + authDecisionId);
        console.log(JSON.stringify(that.authDecisions, null, 4));
    };

    // Authorization Codes
    // -------------------

    // TODO make authCodes active only for a limited period of time
    // TODO make authCodes single use

    that.saveAuthCode = function (authDecisionId, code) {
        that.authCodes.push({
            authDecisionId: authDecisionId, // foreign key
            code: code
        });
        console.log("SAVE AUTH CODE: code=" + code);
        console.log(JSON.stringify(that.authCodes, null, 4));
    };

    // Authorization Decision join Authorization Code
    // ----------------------------------------------

    that.findAuthByCode = function (code) {
        var authCode = _.find(that.authCodes, function (ac) { return ac.code === code });
        if (!authCode) {
            return authCode;
        }
        // TODO when move to CouchDB, do join there, rather than by hand
        var authDecision = that.findAuthDecisionById(authCode.authDecisionId);
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

    that.findAuthorizedClientsByUserId = function (userId) {
        var userAuthDecisions = _.filter(that.authDecisions, function (ad) {
            return ad.userId === userId && ad.revoked === false;
        });
        // TODO when move to CouchDB, do join there, rather than by hand
        var authorizedClients = [];
        userAuthDecisions.forEach(function (ad) {
            var client = that.findClientById(ad.clientId);
            if (client) {
                authorizedClients.push({
                    authDecisionId: ad.id,
                    clientName: client.name
                });
            }
        });
        return authorizedClients;
    };

    return that;

};
