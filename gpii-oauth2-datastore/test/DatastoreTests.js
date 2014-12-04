/*
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

var fluid = fluid || require("infusion");
var jqUnit = fluid.require("jqUnit");
require("../inMemoryDatastore.js");

(function () {

    "use strict";

    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.tests.oauth2.datastore");
    fluid.registerNamespace("gpii.tests.oauth2.datastore.testdata");

    fluid.defaults("gpii.tests.oauth2.datastore.datastoreWithTestData", {
        gradeNames: ["gpii.oauth2.inMemoryDatastore", "autoInit"],
        model: {
            users: [
                { id: 1, username: "alice", password: "a" },
                { id: 2, username: "bob", password: "b" }
            ],
            clients: [
                {
                    id: 1,
                    name: "Client A",
                    oauth2ClientId: "client_id_A",
                    oauth2ClientSecret: "client_secret_A",
                    redirectUri: "http://example.com/callback_A"
                },
                {
                    id: 2,
                    name: "Client B",
                    oauth2ClientId: "client_id_B",
                    oauth2ClientSecret: "client_secret_B",
                    redirectUri: "http://example.com/callback_B"
                },
                {
                    id: 3,
                    name: "Client C",
                    oauth2ClientId: "client_id_C",
                    oauth2ClientSecret: "client_secret_C",
                    redirectUri: "http://example.com/callback_C"
                }
            ]
        }
    });

    gpii.tests.oauth2.datastore.testdata.userId1 = 1;

    gpii.tests.oauth2.datastore.testdata.authDecision1 = {
        userId: gpii.tests.oauth2.datastore.testdata.userId1,
        clientId: 2,
        redirectUri: "http://example.com/callback_B",
        accessToken: "access_token_1"
    };

    gpii.tests.oauth2.datastore.testdata.authDecision2 = {
        userId: gpii.tests.oauth2.datastore.testdata.userId1,
        clientId: 3,
        redirectUri: "http://example.com/callback_C",
        accessToken: "access_token_2"
    };

    gpii.tests.oauth2.datastore.testdata.authDecision3 = {
        userId: gpii.tests.oauth2.datastore.testdata.userId1,
        clientId: 2,
        redirectUri: "http://example.com/callback_B",
        accessToken: "access_token_3"
    };

    gpii.tests.oauth2.datastore.verifyAlice = function (user) {
        jqUnit.assertEquals("username is alice", "alice", user.username);
        jqUnit.assertEquals("password is a", "a", user.password);
    };

    gpii.tests.oauth2.datastore.verifyBob = function (user) {
        jqUnit.assertEquals("username is bob", "bob", user.username);
        jqUnit.assertEquals("password is b", "b", user.password);
    };

    gpii.tests.oauth2.datastore.verifyClientA = function (client) {
        jqUnit.assertEquals("name", "Client A", client.name);
        jqUnit.assertEquals("oauth2ClientId", "client_id_A", client.oauth2ClientId);
        jqUnit.assertEquals("oauth2ClientSecret", "client_secret_A", client.oauth2ClientSecret);
        jqUnit.assertEquals("redirectUri", "http://example.com/callback_A", client.redirectUri);
    };

    gpii.tests.oauth2.datastore.verifyClientB = function (client) {
        jqUnit.assertEquals("name", "Client B", client.name);
        jqUnit.assertEquals("oauth2ClientId", "client_id_B", client.oauth2ClientId);
        jqUnit.assertEquals("oauth2ClientSecret", "client_secret_B", client.oauth2ClientSecret);
        jqUnit.assertEquals("redirectUri", "http://example.com/callback_B", client.redirectUri);
    };

    gpii.tests.oauth2.datastore.saveAuthDecision = function (datastore, authDecision) {
        return datastore.saveAuthDecision(authDecision.userId, authDecision.clientId,
            authDecision.redirectUri, authDecision.accessToken);
    };

    gpii.tests.oauth2.datastore.saveAuthDecision1 = function (datastore) {
        return gpii.tests.oauth2.datastore.saveAuthDecision(datastore,
            gpii.tests.oauth2.datastore.testdata.authDecision1);
    };

    gpii.tests.oauth2.datastore.saveAuthDecision2 = function (datastore) {
        return gpii.tests.oauth2.datastore.saveAuthDecision(datastore,
            gpii.tests.oauth2.datastore.testdata.authDecision2);
    };

    gpii.tests.oauth2.datastore.saveAuthDecision3 = function (datastore) {
        return gpii.tests.oauth2.datastore.saveAuthDecision(datastore,
            gpii.tests.oauth2.datastore.testdata.authDecision3);
    };

    gpii.tests.oauth2.datastore.findAuthDecision1 = function (datastore) {
        return datastore.findAuthDecision(gpii.tests.oauth2.datastore.testdata.authDecision1.userId,
            gpii.tests.oauth2.datastore.testdata.authDecision1.clientId,
            gpii.tests.oauth2.datastore.testdata.authDecision1.redirectUri);
    };

    gpii.tests.oauth2.datastore.verifyAuthDecision1 = function (authDecision) {
        jqUnit.assertEquals("userId", gpii.tests.oauth2.datastore.testdata.authDecision1.userId, authDecision.userId);
        jqUnit.assertEquals("clientId", gpii.tests.oauth2.datastore.testdata.authDecision1.clientId, authDecision.clientId);
        jqUnit.assertEquals("redirectUri", gpii.tests.oauth2.datastore.testdata.authDecision1.redirectUri, authDecision.redirectUri);
        jqUnit.assertEquals("accessToken", gpii.tests.oauth2.datastore.testdata.authDecision1.accessToken, authDecision.accessToken);
        jqUnit.assertFalse("not revoked", authDecision.revoked);
    };

    gpii.tests.oauth2.datastore.saveAuthCode1 = function (datastore, authDecisionId) {
        datastore.saveAuthCode(authDecisionId, "code_1");
    };

    gpii.tests.oauth2.datastore.findAuthByCode1 = function (datastore) {
        return datastore.findAuthByCode("code_1");
    };

    gpii.tests.oauth2.datastore.verifyAuthorizedClientB = function (authClient, authDecisionId) {
        jqUnit.assertEquals("authDecisionId", authDecisionId, authClient.authDecisionId);
        jqUnit.assertEquals("clientName", "Client B", authClient.clientName);
    };

    gpii.tests.oauth2.datastore.verifyAuthorizedClientC = function (authClient, authDecisionId) {
        jqUnit.assertEquals("authDecisionId", authDecisionId, authClient.authDecisionId);
        jqUnit.assertEquals("clientName", "Client C", authClient.clientName);
    };

    jqUnit.module("GPII OAuth2 data store");

    jqUnit.test("findUserById() returns the user for existing id", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        gpii.tests.oauth2.datastore.verifyAlice(datastore.findUserById(1));
        gpii.tests.oauth2.datastore.verifyBob(datastore.findUserById(2));
    });

    jqUnit.test("findUserById() returns falsey for non-existing id", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        jqUnit.assertFalse("non-existing user is falsey", datastore.findUserById(-1));
    });

    jqUnit.test("findUserByUsername() returns the user for existing username", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        gpii.tests.oauth2.datastore.verifyAlice(datastore.findUserByUsername("alice"));
        gpii.tests.oauth2.datastore.verifyBob(datastore.findUserByUsername("bob"));
    });

    jqUnit.test("findUserByUsername() returns falsey for non-existing username", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        jqUnit.assertFalse("non-existing user is falsey", datastore.findUserByUsername("NON-EXISTING"));
    });

    jqUnit.test("findClientById() returns the client for existing id", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        gpii.tests.oauth2.datastore.verifyClientA(datastore.findClientById(1));
        gpii.tests.oauth2.datastore.verifyClientB(datastore.findClientById(2));
    });

    jqUnit.test("findClientById() returns falsey for non-existing id", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        jqUnit.assertFalse("non-existing client is falsey", datastore.findClientById(-1));
    });

    jqUnit.test("findClientByOauth2ClientId() returns the client for existing client_id", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        gpii.tests.oauth2.datastore.verifyClientA(datastore.findClientByOauth2ClientId("client_id_A"));
        gpii.tests.oauth2.datastore.verifyClientB(datastore.findClientByOauth2ClientId("client_id_B"));
    });

    jqUnit.test("findClientByOauth2ClientId() returns falsey for non-existing client_id", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        jqUnit.assertFalse("non-existing client is falsey", datastore.findClientByOauth2ClientId("NON-EXISTING"));
    });

    jqUnit.test("saveAuthDecision() assigns an id and returns the new entity", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        var authDecision1 = gpii.tests.oauth2.datastore.saveAuthDecision1(datastore);
        gpii.tests.oauth2.datastore.verifyAuthDecision1(authDecision1);
        jqUnit.assertValue("Id has been assigned", authDecision1.id);
    });

    jqUnit.test("findAuthDecisionById() finds an existing authorization", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        var authDecision1 = gpii.tests.oauth2.datastore.saveAuthDecision1(datastore);
        var retrieved = datastore.findAuthDecisionById(authDecision1.id);
        gpii.tests.oauth2.datastore.verifyAuthDecision1(retrieved);
    });

    jqUnit.test("findAuthDecisionById() returns falsey for non-existing authorization", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        jqUnit.assertFalse("non-existing authDecision is falsey",
            datastore.findAuthDecisionById(-1));
    });

    jqUnit.test("findAuthDecision() finds an existing authorization and falsey for revoked", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        // save
        var authDecision1 = gpii.tests.oauth2.datastore.saveAuthDecision1(datastore);
        // find and verify
        gpii.tests.oauth2.datastore.verifyAuthDecision1(gpii.tests.oauth2.datastore.findAuthDecision1(datastore));
        // revoke
        datastore.revokeAuthDecision(authDecision1.userId, authDecision1.id);
        // verify no longer found
        jqUnit.assertFalse("revoked authDecision is falsey",
            gpii.tests.oauth2.datastore.findAuthDecision1(datastore));
    });

    jqUnit.test("findAuthDecision() returns falsey for non-existing authorization", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        jqUnit.assertFalse("non-existing authDecision is falsey",
            gpii.tests.oauth2.datastore.findAuthDecision1(datastore));
    });

    jqUnit.test("saveAuthCode(), verify findAuthByCode(), revoke, and then verify no longer found", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        // save authDecision and authCode
        var authDecision1 = gpii.tests.oauth2.datastore.saveAuthDecision1(datastore);
        gpii.tests.oauth2.datastore.saveAuthCode1(datastore, authDecision1.id);
        // find and verify
        var auth = gpii.tests.oauth2.datastore.findAuthByCode1(datastore);
        jqUnit.assertEquals("clientId",
            gpii.tests.oauth2.datastore.testdata.authDecision1.clientId,
            auth.clientId);
        jqUnit.assertEquals("redirectUri",
            gpii.tests.oauth2.datastore.testdata.authDecision1.redirectUri,
            auth.redirectUri);
        jqUnit.assertEquals("accessToken",
            gpii.tests.oauth2.datastore.testdata.authDecision1.accessToken,
            auth.accessToken);
        // revoke authorization
        datastore.revokeAuthDecision(authDecision1.userId, authDecision1.id);
        // verify no longer found
        jqUnit.assertFalse("revoked authorization is falsey", gpii.tests.oauth2.datastore.findAuthByCode1(datastore));
    });

    jqUnit.test("findAuthorizedClientsByUserId() with revoking", function () {
        var datastore = gpii.tests.oauth2.datastore.datastoreWithTestData();
        // save authDecisions
        var authDecision1 = gpii.tests.oauth2.datastore.saveAuthDecision1(datastore);
        var authDecision2 = gpii.tests.oauth2.datastore.saveAuthDecision2(datastore);
        var userId = gpii.tests.oauth2.datastore.testdata.userId1;
        // find both clients
        var clients = datastore.findAuthorizedClientsByUserId(userId);
        jqUnit.assertEquals("2 clients", 2, clients.length);
        gpii.tests.oauth2.datastore.verifyAuthorizedClientB(clients[0], authDecision1.id);
        gpii.tests.oauth2.datastore.verifyAuthorizedClientC(clients[1], authDecision2.id);
        // revoke authDecision1
        datastore.revokeAuthDecision(authDecision1.userId, authDecision1.id);
        clients = datastore.findAuthorizedClientsByUserId(userId);
        jqUnit.assertEquals("1 client", 1, clients.length);
        gpii.tests.oauth2.datastore.verifyAuthorizedClientC(clients[0], authDecision2.id);
        // save a new authDecision and verify found
        var authDecision3 = gpii.tests.oauth2.datastore.saveAuthDecision3(datastore);
        clients = datastore.findAuthorizedClientsByUserId(userId);
        jqUnit.assertEquals("2 clients", 2, clients.length);
        gpii.tests.oauth2.datastore.verifyAuthorizedClientC(clients[0], authDecision2.id);
        gpii.tests.oauth2.datastore.verifyAuthorizedClientB(clients[1], authDecision3.id);
        // revoke authDecision2 and authDecision3
        datastore.revokeAuthDecision(authDecision2.userId, authDecision2.id);
        datastore.revokeAuthDecision(authDecision3.userId, authDecision3.id);
        clients = datastore.findAuthorizedClientsByUserId(userId);
        jqUnit.assertEquals("0 clients", 0, clients.length);
    });

})();
