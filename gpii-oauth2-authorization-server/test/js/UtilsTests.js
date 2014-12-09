/* global jqUnit */

var fluid = fluid || require("infusion");

(function () {

    "use strict";

    var gpii = fluid.registerNamespace("gpii");
    fluid.registerNamespace("gpii.tests.oauth2.utils");

    gpii.tests.oauth2.utils.makeTestMiddleware = function (called, key) {
        return function (req, res, next) {
            jqUnit.assertEquals("request", "request", req);
            jqUnit.assertEquals("response", "response", res);
            called[key] = true;
            next();
        };
    };

    gpii.tests.oauth2.utils.runTests = function () {

        jqUnit.module("GPII OAuth2 Utils");

        jqUnit.asyncTest("Walk an empty array of middleware", function () {
            jqUnit.expect(0);
            gpii.oauth2.utils.walkMiddleware([], 0, "request", "response", function () { jqUnit.start(); });
        });

        jqUnit.asyncTest("Walk an array of 1 middleware", function () {
            jqUnit.expect(3);
            var called = {};
            var middleware1 = gpii.tests.oauth2.utils.makeTestMiddleware(called, "middleware1");
            var check = function () {
                jqUnit.assertTrue("middleware1 called", called["middleware1"]);
                jqUnit.start();
            };
            gpii.oauth2.utils.walkMiddleware([middleware1], 0, "request", "response", check);
        });

        jqUnit.asyncTest("Walk an array of 2 middleware", function () {
            jqUnit.expect(6);
            var called = {};
            var middleware1 = gpii.tests.oauth2.utils.makeTestMiddleware(called, "middleware1");
            var middleware2 = gpii.tests.oauth2.utils.makeTestMiddleware(called, "middleware2");
            var check = function () {
                jqUnit.assertTrue("middleware1 called", called["middleware1"]);
                jqUnit.assertTrue("middleware2 called", called["middleware2"]);
                jqUnit.start();
            };
            gpii.oauth2.utils.walkMiddleware([middleware1, middleware2], 0, "request", "response", check);
        });

        jqUnit.asyncTest("Walk a single middleware function", function () {
            jqUnit.expect(3);
            var called = {};
            var middleware1 = gpii.tests.oauth2.utils.makeTestMiddleware(called, "middleware1");
            var check = function () {
                jqUnit.assertTrue("middleware1 called", called["middleware1"]);
                jqUnit.start();
            };
            gpii.oauth2.utils.walkMiddleware(middleware1, 0, "request", "response", check);
        });

    };
})();
