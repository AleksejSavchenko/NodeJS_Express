'use strict';
process.env.HOST = 'localhost';
process.env.PORT = '3010';

process.env.DB_HOST = 'localhost';
process.env.DB_NAME = 'js_course';
process.env.DB_PORT = '27017';

exports.mongoConfig = {
    db: {native_parser: true},
    server: {poolSize: 5}
};
exports.sessionConfig = function (db) {
    return {
        mongooseConnection: db,
        autoRemove: 'interval',
        autoRemoveInterval: 1 //in prod mode should be more/ 10
    }
};