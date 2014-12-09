"use strict";

var fluid = require("infusion");

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.oauth2");

fluid.defaults("gpii.oauth2.userService", {
    gradeNames: ["fluid.eventedComponent", "autoInit"],
    components: {
        datastore: {
            type: "gpii.oauth2.datastore"
        }
    },
    invokers: {
        authenticateUser: {
            funcName: "gpii.oauth2.userService.authenticateUser",
            args: ["{datastore}", "{arguments}.0", "{arguments}.1"]
            //                    username, password
        },
        getUserById: {
            func: "{datastore}.findUserById"
        }
    }
});

gpii.oauth2.userService.authenticateUser = function (datastore, username, password) {
    var user = datastore.findUserByUsername(username);
    // TODO store passwords securely
    if (user && user.password === password) {
        return user;
    }
    return false;
};
