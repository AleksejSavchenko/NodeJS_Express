'use strict';

var express = require('express');
var router = express.Router();
var VariantHandler = require('../handlers/variant');
var rolesHandler = require('../handlers/userRoles');
var ROLES = require('../constants/roles');

module.exports = function (app) {
    var db = app.db;
    var variantHandler = new VariantHandler(db);

    router.get('/category/:id', variantHandler.getAllVariantsOfCategory); //Show all variants of category.
    router.get('/:id', variantHandler.getVariantById); //Show variant by id.
    router.post('/', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, variantHandler.addVariant, db)}); //Create a new variant.
    router.patch('/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, variantHandler.changeVariant, db)}); //Edit variant by id.
    router.delete('/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, variantHandler.removeVariantById, db)}); //Delete variant by id.
    return router;
};
