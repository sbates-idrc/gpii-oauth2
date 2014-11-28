/*
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

var fluid = fluid || require("infusion");
var jqUnit = fluid.require("jqUnit");
var datastore = require("../index.js");

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

    gpii.tests.oauth2.datastore.saveAuthDecision1 = function (data) {
        return data.saveAuthDecision(gpii.tests.oauth2.datastore.testdata.authDecision1.userId,
            gpii.tests.oauth2.datastore.testdata.authDecision1.clientId,
            gpii.tests.oauth2.datastore.testdata.authDecision1.redirectUri,
            gpii.tests.oauth2.datastore.testdata.authDecision1.accessToken);
    };

    gpii.tests.oauth2.datastore.findAuthDecision1 = function (data) {
        return data.findAuthDecision(gpii.tests.oauth2.datastore.testdata.authDecision1.userId,
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
        var data = datastore.createDatastore();
        var user = data.findUserById(1);
        jqUnit.assertEquals("username is alice", "alice", user.username);
    });

    jqUnit.test("findUserById() returns falsey for non-existing id", function () {
        var data = datastore.createDatastore();
        var user = data.findUserById(10);
        jqUnit.assertFalse("user is falsey", user);
    });

    jqUnit.test("Save an Authorization Decision and retrieve it", function () {
        var data = datastore.createDatastore();
        var authDecision1 = gpii.tests.oauth2.datastore.saveAuthDecision1(data);
        gpii.tests.oauth2.datastore.verifyAuthDecision1(authDecision1);
        jqUnit.assertValue("Id has been assigned", authDecision1.id);
        var retrieved = gpii.tests.oauth2.datastore.findAuthDecision1(data);
        gpii.tests.oauth2.datastore.verifyAuthDecision1(retrieved);
    });

})();
