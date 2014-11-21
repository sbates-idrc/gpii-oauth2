module.exports = function (data) {

    var getClientById = function (clientId) {
        return data.findClientById(clientId);
    };

    return {
        getClientById: getClientById
    };

};
