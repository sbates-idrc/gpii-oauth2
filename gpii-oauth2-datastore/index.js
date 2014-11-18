var _ = require('lodash');

var users = [
    { id: 1, username: 'alice', password: 'a' },
    { id: 2, username: 'bob', password: 'b' }
];

var clients = [
    { id: 1, name: 'client_1', clientId: 'client_id_1', clientSecret: 'client_secret_1' }
];

var authCodes = [];

exports.findUserById = function (id) {
    return _.find(users, function (user) { return user.id === id });
};

exports.findUserByUsername = function (username) {
    return _.find(users, function (user) { return user.username === username} );
};

exports.findClientById = function (id) {
    return _.find(clients, function (client) { return client.id === id });
};

exports.saveAuthCode = function (code, clientId, redirectUri, userId) {
    authCodes.push({ code: code, clientId: clientId, redirectUri: redirectUri, userId: userId });
};

exports.findAuthCodeByCode = function (code) {
    // TODO make authCodes active only for a limited period of time
    return _.find(authCodes, function (ac) { return ac.code === code });
};
