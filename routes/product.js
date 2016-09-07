'use strict';

var express = require('express');
var router = express.Router();
var ProductHandler = require('../handlers/product');
var rolesHandler = require('../handlers/userRoles');
var ROLES = require('../constants/roles');

module.exports = function (app) {
    var db = app.db;
    var productHandler = new ProductHandler(db);

    router.get('/category/:id', productHandler.getProductsByCategoryId); //View products by category id.
    router.get('/variant/:id', productHandler.getProductByVariantId); //View products by variant id.
    router.get('/:id', productHandler.getProduct); //Show product by id.
    router.get('/', productHandler.getProducts); //Show all products.
    router.post('/', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, productHandler.addProduct, db)}); //Create a new product.
    router.patch('/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, productHandler.changeProduct, db)}); //Edit attributes the product.
    router.delete('/:id', function (req, res, next) {
        rolesHandler(req, res, next, ROLES.admin, productHandler.deleteProduct, db)}); //Delete product.
    return router;
};