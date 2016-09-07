'use strict';

module.exports = (function () {
    var mongoose = require('mongoose');
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var schema = new mongoose.Schema({
        login: {type: String, require: true, unique: true},
        password: {type: String, require: true},
        name: {type: String, require: true, unique: false},
        age: Number,
        admin: {type: Boolean, default: false},
        basket: [{type: ObjectId, ref: 'product'}],

        createBy: {
            user: {type: ObjectId, ref: 'user', default: null},
            date: {type: Date, default: new Date()}
        },

        editBy: {
            user: {type: ObjectId, ref: 'user', default: null},
            date: {type: Date, default: new Date()}
        }
    }, {collection: 'users'});

    schema.virtual('fullName').get(function () {
        return this.name + ' ' + this.login;
    });

    schema.set('toJSON', {virtuals: true});

    schema.index({name: 1}, {unique: true});

    mongoose.model('user', schema);

    if (!mongoose.Schemas) {
        mongoose.Schemas = {};
    }
    mongoose.Schemas.user = schema;
})();
