'use strict';

var CategoryHandler = function (db) {
    var modelAndSchemaName = 'category';
    var mongoose = require('mongoose');

    var ObjectId = mongoose.Types.ObjectId;

    var schema = mongoose.Schemas[modelAndSchemaName];
    var Model = db.model(modelAndSchemaName, schema);

    this.addCategory = function (req, res, next) { //Method adds a new category.
        var option = req.body;
        var categoryName = option.name;
        var customError;
        var saveData;
        var model;

        if (!categoryName) {
            customError = new Error('Enter the category name!');
            customError.status = 400;
            return next(customError);
        }

        saveData = {
            name: categoryName
        };

        model = new Model(saveData);

        model.save(function (error, model) {
            if (error) {
                return next(error)
            }
            res.status(200).send(model);
        })
    };

    this.getAllCategories = function (req, res, next) { //Method for showing all categories.

        var pipeLine = [];

        pipeLine.push({
            $match: {}
        });

        pipeLine.push({
            $project: {
                name: 1
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

    this.getCategory = function (req, res, next) { //Method for showing category.
        var categoryId = req.params.id;
        categoryId = ObjectId(categoryId);
        var pipeLine = [];

        pipeLine.push({
            $match: {_id: categoryId}
        });

        pipeLine.push({
            $project: {
                name: 1
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

    this.changeCategory = function (req, res, next) { //The method for changing the category by id.
        var option = req.body;
        var categoryId = req.params.id;
        var categoryName = option.name;
        var customError;
        var id;

        if (!categoryName) {
            customError = new Error('Name is empty');
            customError.status = 400;
            return next(customError);
        }
        var newName = {
            name: categoryName
        };

        id = ObjectId(categoryId);

        Model.update({_id: id}, {$set: newName}, function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).send('Category updated successfully!');
        })
    };

    /*this.addProductToCategory = function (req, res, next) { //The method for adding the product to category.

        var option = req.body;
        var productId = option.product || null;

        Model.update({_id: id}, {$addToSet: {'product': productId}}, function (err) {
            if (err) {
                return next(err);
            }
            res.status(201).send('Product with id: ' + productId + ' is added to category!');
        });
    };*/

    this.removeCategoryById = function (req, res, next) { //The method for deleting the category by id.
        var id = req.params.id;

        Model.findByIdAndRemove(id, function (error) {
            if (error) {
                return next(error);
            } else {
                res.status(200).send('Delete category with id:' + id + ' successful!');
            }
        })
    };
};
module.exports = CategoryHandler;