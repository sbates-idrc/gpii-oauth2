/*!
GPII OAuth2 server

Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

// Declare dependencies
/* global fluid, history */

var gpii = gpii || {};

(function () {
    "use strict";

    fluid.defaults("gpii.oauth.login", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
            header: ".gpiic-oath-login-header",
            instructions: ".gpiic-oauth-login-instructions",
            usernameLabel: ".gpiic-oauth-login-usernameLabel",
            usernameInput: ".gpiic-oauth-login-usernameInput",
            passwordLabel: ".gpiic-oauth-login-passwordLabel",
            passwordInput: ".gpiic-oauth-login-passwordInput",
            error: ".gpiic-oauth-login-error",
            errorIcon: ".gpiic-oauth-login-errorIcon",
            cancel: ".gpiic-oauth-login-cancel",
            submit: ".gpiic-oauth-login-submit"
        },
        strings: {
            header: "Log in",
            instructions: "Enter you account details below.",
            usernameLabel: "Enter email or username",
            passwordLabel: "Password",
            error: "Password and username do not match.",
            cancel: "cancel",
            submit: "log in"
        },
        model: {
            loginFailure: false
        },
        protoTree: {
            header: {messagekey: "header"},
            instructions: {messagekey: "instructions"},
            usernameLabel: {messagekey: "usernameLabel"},
            usernameInput: {value: ""},
            passwordLabel: {messagekey: "passwordLabel"},
            passwordInput: {value: ""},
            cancel: {messagekey: "cancel"},
            submit: {messagekey: "submit"},
            expander: {
                type: "fluid.renderer.condition",
                condition: "${{that}.model.loginFailure}",
                trueTree: {
                    error: {messagekey: "error"},
                    errorIcon: {}
                }
            }
        },
        renderOnInit: true,
        invokers: {
            cancel: "gpii.oauth.login.cancel"
        },
        listeners: {
            "afterRender.bindCancel": {
                "this": "{that}.dom.cancel",
                "method": "click",
                "args": "{that}.cancel"
            }
        },
        modelListeners: {
            "loginFailure": "{that}.refreshView"
        }
    });

    gpii.oauth.login.cancel = function () {
        history.back();
    };
})();
