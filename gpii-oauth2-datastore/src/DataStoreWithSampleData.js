/*
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

"use strict";

var fluid = require("infusion");
var util = require("util");
var config = require("../../config");

fluid.defaults("gpii.oauth2.dataStoreWithSampleData", {
    gradeNames: ["gpii.oauth2.inMemoryDataStore", "autoInit"],
    model: {
        users: [
            { id: 1, username: "alice", password: "a", gpiiToken: "alice_gpii_token" },
            { id: 2, username: "bob", password: "b", gpiiToken: "bob_gpii_token" },
            { id: 3, username: "test31", password: "test12", gpiiToken: "u2v00s7c3celq836ffmbf48q8u" },
            { id: 4, username: "test32", password: "test12", gpiiToken: "dsjs5c95k3q8oj3o9vopdathlr" },
            { id: 5, username: "test33", password: "test12", gpiiToken: "68574tivtoemmm174gof9rf3pe" },
        ],
        clients: [
            {
                id: 1,
                name: "Service A",
                oauth2ClientId: "client_id_1",
                oauth2ClientSecret: "client_secret_1",
                redirectUri: util.format("http://localhost:%d/authorize_callback", config.clientPort)
            },
            {
                id: 2,
                name: "Service Passport Client",
                oauth2ClientId: "client_id_pp",
                oauth2ClientSecret: "client_secret_pp",
                redirectUri: util.format("http://localhost:%d/authorize_callback", config.passportClientPort)
            },
            {
                id: 3,
                name: "Easit4all",
                oauth2ClientId: "client_easit4all",
                oauth2ClientSecret: "client_secret_easit4all",
                redirectUri: util.format("http://localhost:8080/asit/oauth_signin/authorize_callback")
            }
        ]
    }
});
