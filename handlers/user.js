'use strict';

var UserHandler = function (db) {

    var modelAndSchemaName = 'user';
    var mongoose = require('mongoose');
    var bcrypt = require('bcryptjs');

    var ObjectId = mongoose.Types.ObjectId;
    var schema = mongoose.Schemas[modelAndSchemaName];
    var Model = db.model(modelAndSchemaName, schema);

    var schemaPurchase = mongoose.Schemas['purchase'];
    var ModelPurchase = db.model('purchase', schemaPurchase);


    this.loginUser = function (req, res, next) { //Method for login user.
        var session = req.session;
        var option = req.body;
        var userLogin = option.login;
        var userPassword = option.password;
        var query;
        var isEmailValid;
        //var emailRegExp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        var error;

        //if (userLogin) {
        //    isEmailValid = emailRegExp.test(userLogin);
        //}

        if (!userLogin || !userPassword) { //|| !isEmailValid
            error = new Error();
            error.status(400);
            return next(error);
        }

        query = Model.findOne({login: userLogin});

        query.exec(function (err, user) {

            if (err) {
                return next(err);
            }

            if (!user || !bcrypt.compareSync(userPassword, user.password)) {
                error = new Error();
                error.status = 401;
                return next(error);
            }

            session.loggedIn = true;
            session.uId = user._id;

            session.userName = user.name;
            session.cookie.expires = false;

            res.status(200).send(user);
        });
    };

    this.loggedOutUser = function (req, res, next) { //Method for logout user.
        req.session.destroy();
        res.status(200).send('Logged out');
    };

    this.addUser = function (req, res, next) { //Method for the registrations a new user.
        var option = req.body;
        var userName = option.name;
        var userAge = option.age;
        var userLogin = option.login;
        var userPassword = option.password;
        var userAdmin = option.admin;
        var customError;
        var saveData;
        var model;


        var salt = bcrypt.genSaltSync(10);

        if (!userName || !userLogin || !userPassword) {
            customError = new Error('Enter full information of user!');
            customError.status = 400;
            return next(customError);
        }

        saveData = {
            name: userName,
            login: userLogin,
            password: userPassword,
            age: userAge,
            admin: userAdmin
        };

        saveData.password = bcrypt.hashSync(saveData.password, salt);

        model = new Model(saveData);

        model.save(function (error, model) {
            if (error) {
                return next(error);
            }

            var resultFin = {
                _id: model._id,
                name: model.name,
                login: model.login,
                age: model.age,
                admin: model.admin,
                message_for_user: 'Registration successfully complete! Login please'
            };

            res.status(201).send(resultFin);
        });
    };

    this.getUsers = function (req, res, next) { //Method for get all user.
        var pipeLine = [];

        pipeLine.push({
            $match: {}
        });

        pipeLine.push({
            $project: {
                name: 1,
                login: 1,
                admin: 1,
                basket: 1
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

    this.getUserById = function (req, res, next) { //Method for get user by id.
        var id = req.params.id;
        var pipeLine = [];

        id = new ObjectId(id);

        pipeLine.push({
            $match: {
                "_id": id
            }
        });

        pipeLine.push({
            $project: {
                name: 1,
                login: 1,
                admin: 1,
                basket: 1
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

    this.getUser = function (req, res, next) { //Method for get user by id.
        var id = req.session.uId;
        var pipeLine = [];

        id = new ObjectId(id);

        pipeLine.push({
            $match: {
                "_id": id
            }
        });

        pipeLine.push({
            $project: {
                name: 1,
                login: 1,
                admin: 1,
                age: 1,
                basket: 1
            }
        });

        Model.aggregate(pipeLine)
            .exec(function (err, result) {
                if (err) {
                    return next(err);
                }
                if (!result[0]) {
                    res.status(200).send('');
                } else {
                    res.status(200).send(result);
                }
            })
    };

    this.editUser = function (req, res, next) { //Method for editing properties user.

        var option = req.body;
        var userId = req.session.uId;
        var userName = option.name;
        var userLogin = option.login;
        var userPassword = option.password;
        var userAge = option.age;
        var customError;

        //if (!userName) {
        //    customError = new Error('Name error!');
        //    customError.status = 400;
        //    return next(customError);
        //}

        userId = ObjectId(userId);

        var saveData = {
            age: userAge,
            name: userName,
            login: userLogin,
            password: userPassword
        };

        for (var key in saveData) {
            if (!saveData[key]) {
                delete saveData[key];
            }
        }

        Model.update({_id: userId}, {
                $set: saveData
            },
            function (error, result) {
                if (error) {
                    return next(error);
                }
                res.status(200).send(result);
            });
    };

    this.makePurchase = function (req, res, next) { //The method to buy the product(s) from the basket.
        var userId = req.session.uId;
        userId = ObjectId(userId);
        var saveData = {};
        var pipeLine = [];

        Model.find({_id: userId})
            .exec(function (error, modelUser) {
                if (error) {
                    return next(error)
                }

                saveData.user = modelUser[0]._doc._id;
                saveData.name = modelUser[0]._doc._id;
                saveData.product = modelUser[0]._doc.basket;

                pipeLine.push({
                    $match: {
                        _id: userId
                    }
                });

                pipeLine.push({
                    $project: {
                        basket: 1
                    }
                });

                pipeLine.push({
                    $unwind: {
                        path: "$basket",
                        preserveNullAndEmptyArrays: true
                    }
                });

                pipeLine.push({
                    $lookup: {
                        from: "products",
                        localField: "basket",
                        foreignField: "_id",
                        as: "basket"
                    }
                });

                pipeLine.push({
                    $project: {
                        basket: {$arrayElemAt: ["$basket", 0]}
                    }
                });

                pipeLine.push({
                    $project: {
                        basket: {
                            price: "$basket.price"
                        }
                    }
                });

                pipeLine.push({
                    $group: {
                        _id: "$_id",
                        totalAmount: {$sum: "$basket.price"},
                        count: {$sum: 1}
                    }
                });


                Model.aggregate(pipeLine)
                    .exec(function (err, result) {
                        if (err) {
                            return next(err);
                        }

                        saveData.sum = result[0].totalAmount;

                        if (result[0].totalAmount == 0 && result[0].count == 1) {
                            saveData.amount = 0;
                        } else {
                            saveData.amount = result[0].count;
                        }

                        Model.update({_id: userId}, {$pullAll: {basket: saveData.product}})
                            .exec(function (error, result) {
                                if (error) {
                                    return next(error);
                                }
                            });

                        ModelPurchase.update({
                                user: userId
                            },
                            {
                                $set: {
                                    product: saveData.product,
                                    sum: saveData.sum,
                                    amount: saveData.amount
                                }
                            },
                            {
                                upsert: true
                            })
                            .exec(function (error) {
                                if (error) {
                                    return next(error);
                                }
                                ModelPurchase.find({user: userId})
                                    .exec(function (error, modelBuyer) {
                                        if (error) {
                                            return next(error);
                                        }
                                        res.status(200).send(modelBuyer);
                                    });
                            })
                    })
            });
    };

    this.getHistoryPurchase = function (req, res, next) { //The method for showing history of user purchase(s).
        var userId = req.session.uId;
        userId = ObjectId(userId);

        ModelPurchase.findOne({user: userId}).exec(function (err, result) {
            if (err) {
                return next(err)
            }
            if (!result) {
                res.status(200).send('You did`t buy anything yet');
            } else {
                res.status(200).send(result);
            }
        })
    };

    this.addProductToBasket = function (req, res, next) { //Method for the adding a product to basket.
        var id = req.session.uId;
        var option = req.body;
        var productId = option.product || null;

        Model.find({_id: id}, {admin: true, _id: 0}, function (err, result) {

            if (result[0]._doc.admin) { //Inspection of user(field "admin").
                res.status(200).send("You admin!Admin can't buy!\n" + result);
            } else {

                Model.update({_id: id}, {$push: {'basket': productId}}, function (err) {
                    if (err) {
                        return next(err);
                    }
                    res.status(201).send('Added!');
                });
            }
        });
    };

    this.getBasketSum = function (req, res, next) { //We can get summary price of products in basket.
        var userId = req.session.uId;
        userId = ObjectId(userId);

        var pipeLine = [];

        pipeLine.push({
            $match: {
                _id: userId
            }
        });

        pipeLine.push({
            $project: {
                basket: 1
            }
        });

        pipeLine.push({
            $unwind: {
                path: "$basket",
                preserveNullAndEmptyArrays: true
            }
        });

        pipeLine.push({
            $lookup: {
                from: "products",
                localField: "basket",
                foreignField: "_id",
                as: "basket"
            }
        });

        pipeLine.push({
            $project: {
                basket: {$arrayElemAt: ["$basket", 0]}
            }
        });

        pipeLine.push({
            $project: {
                name: 1,
                login: 1,
                basket: {
                    price: "$basket.price"
                }
            }
        });

        pipeLine.push({
            $group: {
                _id: "$_id",
                totalAmount: {$sum: "$basket.price"},
                count: {$sum: 1}
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

    this.removeProductFromBasket = function (req, res, next) { //Method to removing product from basket.

        var id = req.session.uId;
        var productId = req.body.product;
        id = ObjectId(id);

        Model.update({_id: id}, {$pull: {"basket": productId}}, function (result) {
            if (!result) {
                res.status(201).send('Basket is empty!');
            } else {
                res.status(201).send('Deleted!');
            }
        });
    };

    this.removeUserById = function (req, res, next) { //Method for the removing user by id.
        var id = req.params.id;

        Model.findByIdAndRemove(id, function (result) {
            if (!result) {
                res.status(200).send('User is not found');
            } else {
                res.status(200).send('Removed!');
            }
        });
    };

    this.removeHistoryPurchase = function (req, res, next) { //The method for deleting history of user purchase.
        var id = req.session.uId;
        id = ObjectId(id);

        ModelPurchase.findOneAndRemove({user: id}).exec(function (error, result) {
            if (!result) {
                res.status(200).send('History of purchase buyer with id:' + id + ' is empty!');
            } else {
                res.status(200).send('History of purchase buyer with id:' + id + ' deleted successful!');
            }
        })
    };
};
module.exports = UserHandler;
