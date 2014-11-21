module.exports = function (data) {

    var authenticateUser = function (username, password) {
        var user = data.findUserByUsername(username);
        // TODO store passwords securely
        if (user && user.password === password) {
            return user;
        }
        return false;
    };

    var getUserById = function (userId) {
        return data.findUserById(userId);
    };


    return {
        authenticateUser: authenticateUser,
        getUserById: getUserById
    };

};
