'use strict';

var express = require('express');
var router = express.Router();
var CategoryHandler = require('../handlers/category');
var rolesHandler = require('../handlers/userRoles');
var ROLES = require('../constants/roles');

module.exports = function (app) {
    var db = app.db;
    var categoryHandler = new CategoryHandler(db);

    router.get('/:id', categoryHandler.getCategory); //View product by category id.
    router.get('/', categoryHandler.getAllCategories); //Show all categories.
    router.post('/', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, categoryHandler.addCategory, db)}); //Create a new category.
    router.patch('/addProd/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, categoryHandler.addProductToCategory, db)}); //Add product to category.
    router.patch('/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, categoryHandler.changeCategory, db)}); //Edit category by id.
    router.delete('/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, categoryHandler.removeCategoryById, db)}); //Delete category by id.
    return router;
};