var assert = require('assert');
var utils = require('../utils');

function makeTestMiddleware (called, key) {
    return function (req, res, next) {
        assert.equal("request", req);
        assert.equal("response", res);
        called[key] = true;
        next();
    };
}

describe('walkMiddleware', function () {

    it('should walk an empty array of middleware', function (done) {
        utils.walkMiddleware([], 0, "request", "response", done);
    });

    it('should walk an array of 1 middleware', function (done) {
        var called = {};
        var middleware1 = makeTestMiddleware(called, 'middleware1');
        var check = function () {
            assert(called['middleware1']);
            done();
        };
        utils.walkMiddleware([middleware1], 0, "request", "response", check);
    });

    it('should walk an array of 2 middleware', function (done) {
        var called = {};
        var middleware1 = makeTestMiddleware(called, 'middleware1');
        var middleware2 = makeTestMiddleware(called, 'middleware2');
        var check = function () {
            assert(called['middleware1']);
            assert(called['middleware2']);
            done();
        };
        utils.walkMiddleware([middleware1, middleware2], 0, "request", "response", check);
    });

    it('should walk a single middleware function', function (done) {
        var called = {};
        var middleware1 = makeTestMiddleware(called, 'middleware1');
        var check = function () {
            assert(called['middleware1']);
            done();
        };
        utils.walkMiddleware(middleware1, 0, "request", "response", check);
    });

});
