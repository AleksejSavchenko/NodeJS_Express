'use strict';

var ProductHandler = function (db) {
    var modelAndSchemaName = 'product';
    var mongoose = require('mongoose');

    var ObjectId = mongoose.Types.ObjectId;
    var schema = mongoose.Schemas[modelAndSchemaName];
    var Model = db.model(modelAndSchemaName, schema);

    this.addProduct = function (req, res, next) { //Method fo creating a new product.
        var option = req.body;
        var productCategory = option.category;
        var productVariant = option.variant;
        var productName = option.name;
        var productPrice = option.price;
        var productProperty = option.properties || '';
        var customError;
        var saveData;
        var model;

        if (!productName || !productVariant) {
            customError = new Error('productName or productVariant error!');
            customError.status = 400;
            return next(customError);
        }

        saveData = {
            name: productName,
            price: productPrice,
            variant: productVariant,
            category: productCategory,
            properties: productProperty
        };

        model = new Model(saveData);

        model.save(function (error, result) {
            if (error) {
                return next(error);
            }
            res.status(201).send('Product ' + result.name + ' was created successful!');
        });
    };

    this.getProducts = function (req, res, next) { //Method for showing all products.
        var pipeLine = [];

        pipeLine.push({
            $match: {}
        });

        pipeLine.push({
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true
            }
        });

        pipeLine.push({
            $lookup: {
                from: "variants",
                localField: "variant",
                foreignField: "_id",
                as: "variant"
            }
        });
        pipeLine.push({
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        });
        pipeLine.push({
            $project: {
                name: 1,
                price: 1,
                properties: 1,
                variant: {$arrayElemAt: ["$variant", 0]},
                category: {$arrayElemAt: ["$category", 0]}
            }
        });

        pipeLine.push({
            $project: {
                name: 1,
                price: 1,
                properties: 1,
                variant: "$variant.name",
                category: "$category.name"
            }
        });

        Model.aggregate(pipeLine)
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                res.status(200).send(result);
            });
    };

    this.getProductsByCategoryId = function (req, res, next) { //Method for the show products by category id.
        var id = req.params.id;
        id = ObjectId(id);
        var pipeLine = [];

        pipeLine.push({
            $match: {category: id}
        });

        pipeLine.push({
            $group: {
                _id: "$_id",
                name: {$first: "$name"},
                price: {$first: "$price"},
                variant: {$first: "$variant"}
            }
        });

        Model.aggregate(pipeLine)
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                res.status(200).send(result);
            })
    };

    this.getProductByVariantId = function (req, res, next) { //Method for the show products by variant id.
        var id = req.params.id;
        var pipeLine = [];
        id = ObjectId(id);

        pipeLine.push({
            $match: {
                "variant": id
            }
        });

        pipeLine.push({
            $group: {
                _id: "$_id",
                name: {$first: "$name"}
            }
        });

        Model.aggregate(pipeLine)
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                res.status(200).send(result);
            })
    };

    this.getProduct = function (req, res, next) { //Method for showing product.
        var productId = req.params.id;
        var id = ObjectId(productId);
        var pipeLine = [];

        pipeLine.push({
            $match: {_id: id}
        });

        pipeLine.push({
            $unwind: {
                path: "$variant",
                preserveNullAndEmptyArrays: true
            }
        });

        pipeLine.push({
            $lookup: {
                from: "variants",
                localField: "variant",
                foreignField: "_id",
                as: "variant"
            }
        });
        pipeLine.push({
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        });
        pipeLine.push({
            $project: {
                name: 1,
                price: 1,
                properties: 1,
                variant: {$arrayElemAt: ["$variant", 0]},
                category: {$arrayElemAt: ["$category", 0]}
            }
        });

        pipeLine.push({
            $project: {
                name: 1,
                price: 1,
                properties: 1,
                variant: "$variant.name",
                category: "$category.name"
            }
        });

        Model.aggregate(pipeLine)
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                res.status(200).send(result);
            });
    };

    this.changeProduct = function (req, res, next) { //Method for editing properties the product using id.
        var option = req.body;
        var productId = req.params.id;
        var productName = option.name;
        var productPrice = option.price;
        var productVariant = option.variant;
        var productCategory = option.category;
        var productProperties = option.properties;
        var customError;
        var id;

        if (!productVariant) {
            customError = new Error('productName or productVariant error!');
            customError.status = 400;
            return next(customError);
        }

        id = ObjectId(productId);

        var saveData = {
            variant: productVariant,
            category: productCategory,
            name: productName,
            price: productPrice,
            properties: productProperties
        };

        for(var key in saveData){
            if(!saveData[key]){
                delete saveData[key];
            }
        }

        Model.update({_id: id}, {
                $set: saveData
            },
            function (error, result) {
                if (error) {
                    return next(error);
                }
                res.status(200).send(result);
            });
    };

    this.deleteProduct = function (req, res, next) { //Method for deleting product using id.
        var id = req.params.id;

        Model.findByIdAndRemove(id, function (error) {
            if (error) {
                return next(error);
            } else {
                res.status(200).send('Delete product with id:' + id + ' successful!');
            }
        })
    };
};
module.exports = ProductHandler;