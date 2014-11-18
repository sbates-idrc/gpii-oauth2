var _ = require('lodash');

var users = [
    { id: 1, username: 'alice', password: 'a' },
    { id: 2, username: 'bob', password: 'b' }
];

var clients = [
    { id: 1, name: 'client_1', clientId: 'client_id_1', clientSecret: 'client_secret_1' }
];

exports.findUserById = function (id) {
    return _.find(users, function (user) { return user.id === id });
}

exports.findUserByUsername = function (username) {
    return _.find(users, function (user) { return user.username === username} );
}

exports.findClientById = function (id) {
    return _.find(clients, function (client) { return client.id === id });
}
