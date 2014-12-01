var fluid = fluid || require("infusion");

var gpii = fluid.registerNamespace("gpii");
fluid.registerNamespace("gpii.oauth2");

fluid.defaults("gpii.oauth2.userService", {
    gradeNames: ["fluid.standardRelayComponent","autoInit"],
    components: {
        // TODO once we have converted the top level app to a component,
        // TODO create the datastore instance there and inject it
        datastore: {
            type: "gpii.oauth2.datastore"
        }
    },
    invokers: {
        authenticateUser: {
            funcName: "gpii.oauth2.userService.authenticateUser",
            args: ["{datastore}",  "{arguments}.0",  "{arguments}.1"]
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
