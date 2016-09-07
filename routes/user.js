'use strict';

var express = require('express');
var router = express.Router();
var UserHandler = require('../handlers/user');
var rolesHandler = require('../handlers/userRoles');
var ROLES = require('../constants/roles');

module.exports = function (app) {
    var db = app.db;
    var userHandler = new UserHandler(db);

    router.get('/purchase/history', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.buyer, userHandler.getHistoryPurchase, db)
    }); //get history purchase.

    router.get('/all', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, userHandler.getUsers, db)
    }); //Get all users.

    router.get('/purchase', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.buyer, userHandler.makePurchase, db)
    }); //buy goods.

    router.get('/basketSum', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.buyer, userHandler.getBasketSum, db)
    }); //Get summery of basket.

    router.get('/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, userHandler.getUserById, db)
    }); //Get user by id.

    router.get('/', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.allUsers, userHandler.getUser, db)
    });

    router.post('/', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.allUsersForCreate, userHandler.addUser, db)
    }); //Registration a new user.

    router.patch('/basket', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.buyer, userHandler.addProductToBasket, db)
    }); //Add product to basket.

    router.patch('/', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.allUsers, userHandler.editUser, db)
    }); //Add product to basket.

    router.delete('/purchase/history', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.buyer, userHandler.removeHistoryPurchase, db)
    }); //login user.

    router.delete('/basket', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.buyer, userHandler.removeProductFromBasket, db)
    }); //Remove product from user basket.

    router.delete('/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, userHandler.removeUserById, db)
    }); //Delete user by id.

    return router;
};