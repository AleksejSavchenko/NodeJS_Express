'use strict';
module.exports = function (app) {

    var db = app.db;
    var modelAndSchemaName = 'user';
    var mongoose = require('mongoose');
    var bcrypt = require('bcryptjs');

    var schema = mongoose.Schemas[modelAndSchemaName];
    var Model = db.model(modelAndSchemaName, schema);


    var categoryRouter = require('./category')(app);
    var variantRouter = require('./variant')(app);
    var productRouter = require('./product')(app);
    var userRouter = require('./user')(app);
    var UserHandler = require('../handlers/user');
    var CONSTANTS = require('../constants/mainConstants');
    var userHandler = new UserHandler(db);

    var sessionValidator = function (req, res, next) {
        var session = req.session;
        session.cookie.maxAge = CONSTANTS.SESSION_TTL;
        next();
    };

    function checkAuth(req, res, next) {
        if (req.session && req.session.loggedIn) {
            res.status(200).send('YOU LOGGED');
        } else {
            res.status(401).send('YOU NOT LOGGED');
        }
        next();
    }

    function createAndValidAdmin(req, res, next) {
        if(req.session && req.session.loggedIn){
            res.status(200).send('YOU ALREADY LOGGED');
            return;
        }
        Model.findOne({admin: true}).exec(function (err, result) {
            if (result) {
                res.status(200).send('ADMIN ALREADY CREATED!LOGIN PLEASE');
            } else {
                var admin = {
                    name: 'admin',
                    login: 'admin',
                    password: 'admin',
                    admin: true
                };
                var salt = bcrypt.genSaltSync(10);
                admin.password = bcrypt.hashSync(admin.password, salt);
                var model = new Model(admin);
                model.save(function (error, model) {
                    if (error) {
                        return next(error);
                    }
                    res.status(200).send('ADMIN CREATED NOW!LOGIN PLEASE!')
                })
            }
        });
    }

    app.use(sessionValidator);

    /* app.get('/authenticated', function (req, res, next) {
     if (req.session && req.session.loggedIn) {
     res.send(200);
     } else {
     res.send(401);
     }
     });*/

    app.use('/category', categoryRouter);
    app.use('/variant', variantRouter);
    app.use('/product', productRouter);
    app.use('/user', userRouter);

    function errorHandler(err, req, res, next) {
        var errorStatus = err.status || 500;
        var errorMessage = err.message || 'Some error';
        var errorObject = {
            error: {
                status: errorStatus,
                message: errorMessage
            }
        };
        res.status(errorStatus).send(errorObject);
    }

    app.use(errorHandler);

    app.get('/auth', checkAuth);
    app.get('/logout', userHandler.loggedOutUser);
    app.post('/login', userHandler.loginUser);

    app.get('/', function (req, res, next) {
        createAndValidAdmin(req, res, next)
    });
};