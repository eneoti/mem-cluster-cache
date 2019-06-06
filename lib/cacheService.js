'use strict'

var RedisStore = require("./redisStore");
var util = require('util');
var statusKey = 'connections';
var msgpack = require('msgpack-lite');
function CacheService() {
    var self = this;
    RedisStore.apply(this, arguments);
    this.saveObject = (objectKey, field, object) => {
        return new Promise((resolve, reject) => {
            if (!objectKey || !field || !object) {
                reject(new Error('can not cached empty data'));
            }
            else {
                self._db.hset(objectKey, field, msgpack.encode(object), function (err, result) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(object)
                    }

                });
            }

        })
    }
    this.getObjectItem = function (objectKey, propertyValue) {
        return new Promise(function (resolve, reject) {
            if (!objectKey || !propertyValue) {
                reject(new Error('propertyValue is null'));
            }
            self._db.hget(objectKey, propertyValue, function (err, result) {
                if (err) {
                    return reject(err);
                }
                try {
                    var data = null;
                    if (result) {
                        data = msgpack.decode(result);
                    }
                    return resolve(data);
                }
                catch (err) {
                    return reject(err);
                }
            });
        });
    }
    this.getObjectItems = function (objectKey, propertyValues) {
        return new Promise(function (resolve, reject) {
            if (!objectKey || !propertyValues || propertyValues.length == 0) {
                return reject(new Error('propertyValues is null or empty'));
            }
            var multi = self._db.multi();
            for (var i = 0; i < propertyValues.length; i++) {
                multi.hget(objectKey, propertyValues[i]);
            }
            multi.exec(function (err, results) {
                if (err) {
                    return reject(err)
                }
                var data = {};
                for (var i = 0; i < propertyValues.length; i++) {
                    if (!propertyValues[i]) {
                        continue;
                    }
                    var formated = {
                        "value": "unrecognizable"
                    };

                    if (results[i]) {
                        formated = msgpack.decode(results[i]);
                    }
                    data[propertyValues[i]] = formated;
                }
                resolve(data)
            });
        });
    }
    this.getObject = function (objectKey) {
        return new Promise(function (resolve, reject) {
            if (!objectKey) {
                reject(new Error('objectKey is null'));
            }
            self._db.hgetall(objectKey, function (err, result) {
                if (err) {
                    return reject(err);
                }
                for (var key in result) {
                    result[key] = msgpack.decode(result[key]);
                };
                resolve(result);
            });
        });
    }

}

util.inherits(CacheService, RedisStore);
module.exports = CacheService;
