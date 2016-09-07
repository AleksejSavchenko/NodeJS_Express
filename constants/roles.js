module.exports = {
    admin: {
        isLogin: true,
        isAdmin: true,
        isUser: false
    },

    buyer: {
        isLogin: true,
        isAdmin: false,
        isUser: true
    },

    allUsers: {
        isLogin: true,
        isAdmin: false,
        isUser: false
    },

    allUsersForCreate: {
        isLogin: false,
        isAdmin: false,
        isUser: false
    }
};
