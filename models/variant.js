/**
 * Created by Alexus on 15.05.2016.
 */
'use strict';

module.exports = (function () {
    var mongoose = require('mongoose');
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var schema = new mongoose.Schema({
        name: {type: String, unique: true}, //We can use "enum" if it need.
        category: {type: ObjectId, ref: 'category', require: true},
        createBy: {
            user: {type: ObjectId, ref: 'user', default: null},
            date: {type: Date, default: new Date()}
        },

        editBy: {
            user: {type: ObjectId, ref: 'user', default: null},
            date: {type: Date, default: new Date()}
        }

    }, {collection: 'variants'});

    schema.index({name: 1}, {unique: true});

    mongoose.model('variant', schema);

    if (!mongoose.Schemas) {
        mongoose.Schemas = {};
    }
    mongoose.Schemas.variant = schema;
})();
