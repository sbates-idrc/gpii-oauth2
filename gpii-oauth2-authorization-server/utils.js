"use strict";

var walkMiddleware = function (middleware, i, req, res, next) {
    // TODO best way to check if middleware is a single function?
    if (typeof middleware === "function") {
        return middleware(req, res, next);
    }
    if (i >= middleware.length) {
        return next();
    } else {
        return middleware[i](req, res, function () {
            return walkMiddleware(middleware, i+1, req, res, next);
        });
    }
};

exports.walkMiddleware = walkMiddleware;
