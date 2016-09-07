'use strict';

module.exports = (function () {
    var mongoose = require('mongoose');
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var schema = new mongoose.Schema({
        name: {type: String, unique: true, require: true},
        variant: {type: ObjectId, ref: 'variant', require: true},
        category: {type: ObjectId, ref: 'category', require: true}, //We can use "enum" if it need.
        properties: String,
        price: {type: Number},

        createBy: {
            user: {type: ObjectId, ref: 'user', default: null},
            date: {type: Date, default: new Date()}
        },

        editBy: {
            user: {type: ObjectId, ref: 'user', default: null},
            date: {type: Date, default: new Date()}
        }

    }, {collection: 'products'});

    schema.index({name: 1}, {unique: true});

    mongoose.model('product', schema);

    if (!mongoose.Schemas) {
        mongoose.Schemas = {};
    }
    mongoose.Schemas.product = schema;
})();
