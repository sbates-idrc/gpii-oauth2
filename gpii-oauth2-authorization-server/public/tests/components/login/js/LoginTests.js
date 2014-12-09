/*!
GPII OAuth2 server

Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function ($) {
    "use strict";

    fluid.registerNamespace("gpii.tests.oauth");

    fluid.defaults("gpii.tests.oauth.login", {
        gradeNames: ["gpii.oauth.login", "autoInit"],
        model: {
            loginFailure: false
        },
        renderOnInit: false
    });

    gpii.tests.oauth.login.assertRendering = function (that) {
        var keys = ["header", "instructions", "usernameLabel", "passwordLabel", "cancel"];

        fluid.each(keys, function (key) {
            var str = that.options.strings[key];
            jqUnit.assertEquals("The '" + key + "' string should have been rendered", str, that.locate(key).text());
        });

        jqUnit.assertEquals("The 'submit' string should have been rendered", that.options.strings.submit, that.locate("submit").val());

        jqUnit.assertEquals("The username should be empty", "", that.locate("usernameInput").val());
        jqUnit.assertEquals("The password should be empty", "", that.locate("passwordInput").val());
    };

    gpii.tests.oauth.login.assertNoErrorMsg = function (that) {
        jqUnit.notExists("The error message should not be rendered", that.locate("error"));
        jqUnit.notExists("The error message icon should not be rendered", that.locate("errorIcon"));
    };

    gpii.tests.oauth.login.assertErrorMsg = function (that) {
        jqUnit.exists("The error message should be rendered", that.locate("error"));
        jqUnit.exists("The error message icon should be rendered", that.locate("errorIcon"));
    };

    gpii.tests.oauth.login.testLogin = function (that) {
        gpii.tests.oauth.login.assertRendering(that);

        if (that.model.loginFailure) {
            gpii.tests.oauth.login.assertErrorMsg(that);
        } else {
            gpii.tests.oauth.login.assertNoErrorMsg(that);
        }
    };

    fluid.defaults("gpii.tests.oauth.loginTestTree", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            login: {
                type: "gpii.tests.oauth.login",
                container: ".gpiic-oauth-login"
            },
            catTester: {
                type: "gpii.tests.oauth.loginTester"
            }
        }
    });

    fluid.defaults("gpii.tests.oauth.loginTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [ {
            name: "Login tests",
            tests: [{
                name: "Rendering",
                expect: 20,
                sequence: [{
                    func: "{login}.refreshView"
                }, {
                    listener: "gpii.tests.oauth.login.testLogin",
                    event: "{login}.events.afterRender"
                }, {
                    func: "{login}.applier.change",
                    args: ["loginFailure", true]
                }, {
                    listener: "gpii.tests.oauth.login.testLogin",
                    event: "{login}.events.afterRender"
                }]
            }]
        }]
    });

    gpii.tests.oauth.login.runTests = function () {
        fluid.test.runTests([
            "gpii.tests.oauth.loginTestTree"
        ]);
    };
})(jQuery);
