/*
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

var fluid = require("infusion");
var jqUnit = fluid.require("jqUnit");
var data = require("../index.js");

(function () {

    "use strict";

    var datastoreTests = fluid.registerNamespace ("gpii.tests.oauth2datastore");
    var testdata = fluid.registerNamespace ("gpii.tests.oauth2datastore.testdata");

    testdata.authDecision1 = {
        userId: 1,
        clientId: 2,
        redirectUri: "http://example.com/callback",
        accessToken: "access_token_1"
    };

    datastoreTests.saveAuthDecision1 = function () {
        return data.saveAuthDecision(testdata.authDecision1.userId,
            testdata.authDecision1.clientId,
            testdata.authDecision1.redirectUri,
            testdata.authDecision1.accessToken);
    };

    datastoreTests.findAuthDecision1 = function () {
        return data.findAuthDecision(testdata.authDecision1.userId,
            testdata.authDecision1.clientId,
            testdata.authDecision1.redirectUri);
    };

    datastoreTests.verifyAuthDecision1 = function (authDecision) {
        jqUnit.assertEquals("userId", testdata.authDecision1.userId, authDecision.userId);
        jqUnit.assertEquals("clientId", testdata.authDecision1.clientId, authDecision.clientId);
        jqUnit.assertEquals("redirectUri", testdata.authDecision1.redirectUri, authDecision.redirectUri);
        jqUnit.assertEquals("accessToken", testdata.authDecision1.accessToken, authDecision.accessToken);
        jqUnit.assertFalse("not revoked", authDecision.revoked);
    };

    jqUnit.module("GPII OAuth2 data store");

    jqUnit.test("findUserById() returns the user for existing id", function () {
        // TODO reset data
        var user = data.findUserById(1);
        jqUnit.assertEquals("username is alice", "alice", user.username);
    });

    jqUnit.test("findUserById() returns falsey for non-existing id", function () {
        // TODO reset data
        var user = data.findUserById(10);
        jqUnit.assertFalse("user is falsey", user);
    });

    jqUnit.test("Save an Authorization Decision and retrieve it", function () {
        // TODO reset data
        var authDecision1 = datastoreTests.saveAuthDecision1();
        datastoreTests.verifyAuthDecision1(authDecision1);
        jqUnit.assertValue("Id has been assigned", authDecision1.id);
        var retrieved = datastoreTests.findAuthDecision1();
        datastoreTests.verifyAuthDecision1(retrieved);
    });

})();
