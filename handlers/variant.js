/**
 * Created by Alexus on 15.05.2016.
 */
'use strict';

var VariantHandler = function (db) {
    var modelAndSchemaName = 'variant';
    var mongoose = require('mongoose');

    var ObjectId = mongoose.Types.ObjectId;

    var schema = mongoose.Schemas[modelAndSchemaName];
    var Model = db.model(modelAndSchemaName, schema);

    this.addVariant = function (req, res, next) { //Method adds a new variant to category.
        var option = req.body;
        var variantName = option.name;
        var variantCategory = option.category;
        var customError;
        var saveData;
        var model;

        if (!variantName || !variantCategory) {
            customError = new Error('Enter the variant name or variantCategory!');
            customError.status = 400;
            return next(customError);
        }

        saveData = {
            name: variantName,
            category: variantCategory
        };

        model = new Model(saveData);

        model.save(function (error, model) {
            if (error) {
                return next(error)
            }
            res.status(200).send(model);
        })
    };

    this.getAllVariantsOfCategory = function (req, res, next) { //Method for showing all categories.

        var categoryId = req.params.id;
        categoryId = new ObjectId(categoryId);

        var pipeLine = [];

        pipeLine.push({
            $match: {
                category : categoryId
            }
        });

        pipeLine.push({
            $project: {
                name: 1,
                category: 1
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

    this.getVariantById = function (req, res, next) { //Method for showing variant by id.

        var variantId = req.params.id;
        variantId = new ObjectId(variantId);

        var pipeLine = [];

        pipeLine.push({
            $match: {
                _id : variantId
            }
        });

        pipeLine.push({
            $project: {
                name: 1,
                category: 1
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

    this.changeVariant = function (req, res, next) { //The method for changing the category by id.
        var option = req.body;
        var categoryId = req.params.id;
        var categoryName = option.name;
        var customError;
        var id = new ObjectId(categoryId);

        if (!categoryName) {
            customError = new Error('Name is empty');
            customError.status = 400;
            return next(customError);
        }
        var saveData = {
            name: categoryName,
            category: categoryId
        };

        for (var key in saveData) {
            if (!saveData[key]) {
                delete saveData[key];
            }
        }

        Model.update({_id: id}, {$set: saveData}, function (err) {
            if (err) {
                return next(err);
            }
            res.status(200).send('Variant updated successfully!');
        })
    };

    this.removeVariantById = function (req, res, next) { //The method for deleting the category by id.
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
module.exports = VariantHandler;