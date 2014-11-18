var _ = require('lodash');

var clients = [
    { id: 1, name: 'client_1', clientId: 'client_id_1', clientSecret: 'client_secret_1' }
];

var users = [
    { id: 1, username: 'alice' },
    { id: 2, username: 'bob' }
];

exports.findClientById = function (id) {
    return _.find(clients, function (client) { return client.id === id });
}

exports.findUserById = function (id) {
    return _.find(users, function (user) { return user.id === id });
}
