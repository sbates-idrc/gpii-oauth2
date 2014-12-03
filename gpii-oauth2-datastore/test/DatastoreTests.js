/*
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

var fluid = fluid || require("infusion");
var jqUnit = fluid.require("jqUnit");
require("../index.js");

(function () {

    "use strict";

    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.tests.oauth2.datastore");
    fluid.registerNamespace("gpii.tests.oauth2.datastore.testdata");

    gpii.tests.oauth2.datastore.testdata.authDecision1 = {
        userId: 1,
        clientId: 2,
        redirectUri: "http://example.com/callback",
        accessToken: "access_token_1"
    };

    gpii.tests.oauth2.datastore.verifyAlice = function (user) {
        jqUnit.assertEquals("username is alice", "alice", user.username);
        jqUnit.assertEquals("password is a", "a", user.password);
    };

    gpii.tests.oauth2.datastore.verifyBob = function (user) {
        jqUnit.assertEquals("username is bob", "bob", user.username);
        jqUnit.assertEquals("password is b", "b", user.password);
    };

    gpii.tests.oauth2.datastore.saveAuthDecision1 = function (datastore) {
        return datastore.saveAuthDecision(gpii.tests.oauth2.datastore.testdata.authDecision1.userId,
            gpii.tests.oauth2.datastore.testdata.authDecision1.clientId,
            gpii.tests.oauth2.datastore.testdata.authDecision1.redirectUri,
            gpii.tests.oauth2.datastore.testdata.authDecision1.accessToken);
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

    jqUnit.module("GPII OAuth2 data store");

    jqUnit.test("findUserById() returns the user for existing id", function () {
        var datastore = gpii.oauth2.datastore();
        gpii.tests.oauth2.datastore.verifyAlice(datastore.findUserById(1));
        gpii.tests.oauth2.datastore.verifyBob(datastore.findUserById(2));
    });

    jqUnit.test("findUserById() returns falsey for non-existing id", function () {
        var datastore = gpii.oauth2.datastore();
        var user = datastore.findUserById(10);
        jqUnit.assertFalse("user is falsey", user);
    });

    jqUnit.test("findUserByUsername() returns the user for existing username", function () {
        var datastore = gpii.oauth2.datastore();
        gpii.tests.oauth2.datastore.verifyAlice(datastore.findUserByUsername("alice"));
        gpii.tests.oauth2.datastore.verifyBob(datastore.findUserByUsername("bob"));
    });

    jqUnit.test("findUserByUsername() returns falsey for non-existing username", function () {
        var datastore = gpii.oauth2.datastore();
        var user = datastore.findUserByUsername("NON-EXISTING");
        jqUnit.assertFalse("user is falsey", user);
    });

    jqUnit.test("Save an Authorization Decision and retrieve it", function () {
        var datastore = gpii.oauth2.datastore();
        var authDecision1 = gpii.tests.oauth2.datastore.saveAuthDecision1(datastore);
        gpii.tests.oauth2.datastore.verifyAuthDecision1(authDecision1);
        jqUnit.assertValue("Id has been assigned", authDecision1.id);
        var retrieved = gpii.tests.oauth2.datastore.findAuthDecision1(datastore);
        gpii.tests.oauth2.datastore.verifyAuthDecision1(retrieved);
    });

})();
