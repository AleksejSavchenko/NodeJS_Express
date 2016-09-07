'use strict';

var rolesHandler = function (req, res, next, role, callback, db) {

    if (typeof(db) == "undefined") {
        return;
    }
    var modelAndSchemaName = 'user';
    var mongoose = require('mongoose');
    var schema = mongoose.Schemas[modelAndSchemaName];
    var Model = db.model(modelAndSchemaName, schema);

    if (role.isLogin) {
        if (typeof(req.session.uId) == 'undefined') {
            res.status(400).send('User not logged');
            return;
        }
    }
    Model.findById(req.session.uId, function (error, user) {

        if(error){
            return next(error);
        } else {
            if (role.isAdmin) {
                if (!isUserAdmin(user, res)) {
                    return;
                }
            }
            if (role.isUser) {
                if (!isUserBuyer(user, res)) {
                    return;
                }
            }
            callback(req, res, next);
        }
    });
};

function isUserAdmin(user, res) {
    if (!user.admin) {
        res.status(401).send('User is not ADMIN');
        return false;
    }
    return true;
}
function isUserBuyer(user, res) {
    if (user.admin) {
        res.status(401).send('User is not BUYER');
        return false;
    }
    return true;
}
module.exports = rolesHandler;