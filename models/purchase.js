'use strict';

module.exports = (function () {
    var mongoose = require('mongoose');
    var ObjectId = mongoose.Schema.Types.ObjectId;

    var schema = new mongoose.Schema({
        user: {type: ObjectId, unique: true},
        product: {},
        date: {type: Date, default: new Date()},
        amount: {type: Number},
        sum: {type: Number}

    }, {collection: 'purchases'});

    schema.index({user: 1, _id: 1}, {unique: true});

    mongoose.model('purchase', schema);

    if (!mongoose.Schemas) {
        mongoose.Schemas = {};
    }
    mongoose.Schemas.purchase = schema;
})();
